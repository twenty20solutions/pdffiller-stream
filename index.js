const spawn = require("child_process").spawn;
const fdf = require("./fdf.js");
const _ = require("lodash");
const fs = require("fs");

const pdffiller = {
    mapForm2PDF: function (formFields, convMap) {
        tmpFDFData = _.mapKeys(tmpFDFData, function (value, key) {
        let tmpFDFData = this.convFieldJson2FDF(formFields);
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
        const regType = /FieldType: ([A-Za-z\t .]+)/;
        const regFlags = /FieldFlags: ([0-9\t .]+)/;
        const fieldArray = [];

        if (nameRegex !== null && typeof nameRegex == "object")
            regName = nameRegex;

        return new Promise((resolve, reject) => {
            const childProcess = spawn("pdftk", [
                sourceFile,
                "dump_data_fields_utf8",
            ]);
            let output = "";

            childProcess.on("error", (err) => {
                console.log("pdftk exec error: " + err);
                reject(err);
            });

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
                    .then(function (_form_fields) {
                        var _keys = _.map(_form_fields, "title"),
                            _values = _.map(_form_fields, "fieldValue"),
                            jsonObj = _.zipObject(_keys, _values);

                        resolve(jsonObj);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }.bind(this)
        );
    },

    fillFormWithOptions: function (sourceFile, fieldValues, shouldFlatten) {
        var promised = new Promise((resolve, reject) => {
            //Generate the data from the field values.
            const FDFinput = fdf.createFdf(fieldValues);

            var args = [sourceFile, "fill_form", "-", "output", "-"];
            if (shouldFlatten) {
                args.push("flatten");
            }

            const childProcess = spawn("pdftk", args);

            childProcess.stderr.on("data", (err) => {
                console.error("pdftk exec error: " + err);
                reject(err);
            });

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

    fillFormWithFlatten: function (sourceFile, fieldValues, shouldFlatten) {
        return this.fillFormWithOptions(sourceFile, fieldValues, shouldFlatten);
    },

    fillForm: function (sourceFile, fieldValues) {
        return this.fillFormWithFlatten(sourceFile, fieldValues, true);
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
                outputStream.on("close", function () {
                    output.end();
                    resolve();
                });
            })
            .catch(function (error) {
                reject(error);
            });
    });
};

module.exports = pdffiller;
