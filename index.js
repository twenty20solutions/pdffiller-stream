const spawn = require("child_process").spawn;
const fdf = require("./fdf.js");
const fs = require("fs");

const pdffiller = {
    /**
     * This function converts the field names of a JSON object
     * to the field names of a PDF Form. NOT DONE! This is the
     * only reason lodash is here
     * @param {*} formFields - The fields in the PDF
     * @param {*} convMap - The conversion matrix
     */
    mapForm2PDF: function (formFields, convMap) {
        // First, get the field json.
        let tmpFDFData = this.convFieldJson2FDF(formFields);

        // https://github.com/lodash/lodash/blob/master/mapKey.js
        const mapKeys = (object, iteratee) => {
            object = Object(object);
            const result = {};

            Object.keys(object).forEach((key) => {
                const value = object[key];
                result[iteratee(value, key, object)] = value;
            });
            return result;
        };

        tmpFDFData = mapKeys(tmpFDFData, (value, key) => {
            try {
                convMap[key];
            } catch (err) {
                return key;
            }
            return convMap[key];
        });
        return tmpFDFData;
    },

    convFieldJson2FDF: (fieldJson) => {
        let json = {};
        for (const row of fieldJson) {
            let value = row.fieldValue;
            if (value === true) value = "Yes";
            else if (value === false) value = "Off";
            json[row.title] = value;
        }
        return json;
    },

    generateFieldJson: (sourceFile, nameRegex) => {
        let regName = /FieldName: ([^\n]*)/;
        const regType = /FieldType: ([\t .A-Za-z]+)/;
        const regFlags = /FieldFlags: ([\d\t .]+)/;
        const fieldArray = [];

        if (nameRegex !== null && typeof nameRegex == "object")
            regName = nameRegex;

        return new Promise((resolve, reject) => {
            const childProcess = spawn("pdftk", [
                sourceFile,
                "dump_data_fields_utf8",
            ]);
            let output = "";

            childProcess.on("error", (error) => reject(error));
            childProcess.stdout.on("error", (error) => reject(error));
            childProcess.stderr.on("error", (error) => reject(error));
            childProcess.stdin.on("error", (error) => reject(error));

            childProcess.stdout.on("data", (data) => {
                output += data;
            });

            childProcess.stdout.on("end", () => {
                let fields = output.split("---").slice(1);

                fields.forEach((field) => {
                    let currField = {};
                    currField["title"] = field.match(regName)[1].trim() || "";
                    currField["fieldType"] = field.match(regType)
                        ? field.match(regType)[1].trim() || ""
                        : "";
                    currField["fieldFlags"] = field.match(regFlags)
                        ? field.match(regFlags)[1].trim() || ""
                        : "";
                    currField["fieldValue"] = "";
                    fieldArray.push(currField);
                });

                resolve(fieldArray);
            });
        });
    },

    generateFDFTemplate: function (sourceFile, nameRegex) {
        return new Promise(
            function (resolve, reject) {
                this.generateFieldJson(sourceFile, nameRegex)
                    .then((formFields) => {
                        let json = {};
                        for (const row of formFields) {
                            json[row.title] = row.fieldValue;
                        }
                        resolve(json);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }.bind(this)
        );
    },

    fillForm: (sourceFile, fieldValues, extraArguments = ["flatten"]) => {
        const promised = new Promise((resolve, reject) => {
            //Generate the data from the field values.
            const FDFinput = fdf.createFdf(fieldValues);

            const args = [sourceFile, "fill_form", "-", "output", "-"];

            if (typeof extraArguments === "object") {
                for (const argument of extraArguments) {
                    args.push(argument);
                }
            }

            const childProcess = spawn("pdftk", args);

            childProcess.on("error", (error) => reject(error));
            childProcess.stdout.on("error", (error) => reject(error));
            childProcess.stderr.on("error", (error) => reject(error));
            childProcess.stdin.on("error", (error) => reject(error));

            const sendData = (data) => {
                childProcess.stdout.pause();
                childProcess.stdout.unshift(data);
                resolve(childProcess.stdout);
                childProcess.stdout.removeListener("data", sendData);
            };

            childProcess.stdout.on("data", sendData);

            // now pipe FDF to pdftk
            childProcess.stdin.write(FDFinput);
            childProcess.stdin.end();
        });

        // bind convenience method toFile for chaining
        promised.toFile = toFile.bind(null, promised);
        return promised;
    },
};

/**
 * convenience chainable method for writing to a file (see examples)
 **/
const toFile = (promised, path) => {
    return new Promise((resolve, reject) => {
        promised
            .then((outputStream) => {
                const output = fs.createWriteStream(path);
                outputStream.pipe(output);
                outputStream.on("close", () => {
                    output.end();
                    resolve();
                });
            })
            .catch((error) => reject(error));
    });
};

module.exports = pdffiller;
