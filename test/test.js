/*
 *   File:       pdf.js
 *   Project:    PDF Filler
 *   Date:       June 2015.
 *
 */

const pdfFiller = require("..");
const fdf = require("../fdf");
const test = require("ava");

const expected = require("./_expected_data");

const dest2PDF = "test/test_complete2.pdf";
const source2PDF = "test/test.pdf";
const source1PDF = "test/test1.pdf";

const Readable = require("stream").Readable;

/**
 * Unit tests
 */

var _data = {
    baseball: "Yes",
    basketball: "Off",
    date: "Jan 1, 2013",
    first_name: "1) John",
    football: "Off",
    hockey: "Yes",
    last_name: "Doe",
    nascar: "Off",
};

test("should return a readable stream when creating a pdf from test.pdf with filled data", async (t) => {
    const pdf = await pdfFiller.fillForm(source2PDF, _data);
    if (pdf instanceof Readable) {
        t.pass();
    } else {
        t.fail();
    }
});

test("should use toFile to create a completely filled PDF that is read-only", async (t) => {
    await pdfFiller
        .fillFormWithFlatten(source2PDF, _data, true)
        .toFile(dest2PDF);
    const roFdf = await pdfFiller.generateFieldJson(dest2PDF, null);
    t.is(roFdf.length, 0);
});

/*
test("should use toFile to create a completely filled PDF, but to an invalid path", async (t) => {
    const error = await t.throwsAsync(async () => {
        await pdfFiller
            .fillFormWithFlatten(source2PDF, _data, true)
            .toFile("/");
    });
    t.is(error, "Error: EISDIR: illegal operation on a directory, open '/'");
});
*/

test("should create a FDF template with a null value", (t) => {
    const fdfData = fdf.createFdf({
        ..._data,
        nulval: null,
    });
    t.assert(fdfData);
});

/*
test("should fail to FDF template with an invalid value", (t) => {
    const fdfData = fdf.createFdf({
        ..._data,
        badval: {
            badvar: function () {
                return false;
            },
        },
    });
    console.log(fdfData.toString());
    t.not(fdfData, 0);
});
*/

test("should create an unflattened PDF with unfilled fields remaining", async (t) => {
    const dest3PDF = "test/test_complete3.pdf";
    const _data2 = {
        first_name: "Jerry",
    };

    await pdfFiller
        .fillFormWithFlatten(source2PDF, _data2, false)
        .toFile(dest3PDF);
    const rwFdf = await pdfFiller.generateFieldJson(dest3PDF, null);
    t.not(rwFdf.length, 0);
});

test("should handle expanded utf characters and diacritics", async (t) => {
    const dest4PDF = "test/test_complete4.pdf";
    const diacriticsData = Object.assign({}, _data, {
        first_name: "मुख्यपृष्ठम्",
        last_name: "é àالعقائدية الأخرى",
    });

    await pdfFiller
        .fillFormWithFlatten(source2PDF, diacriticsData, false)
        .toFile(dest4PDF);
    const fdf = await pdfFiller.generateFieldJson(dest4PDF, null);
    t.not(fdf.length, 0);
});

test("should generate form field JSON as expected", async (t) => {
    const _expected = [
        {
            fieldFlags: "0",
            title: "first_name",
            fieldValue: "",
            fieldType: "Text",
        },
        {
            fieldFlags: "0",
            title: "last_name",
            fieldValue: "",
            fieldType: "Text",
        },
        {
            fieldFlags: "0",
            title: "date",
            fieldValue: "",
            fieldType: "Text",
        },
        {
            fieldFlags: "0",
            title: "football",
            fieldValue: "",
            fieldType: "Button",
        },
        {
            fieldFlags: "0",
            title: "baseball",
            fieldValue: "",
            fieldType: "Button",
        },
        {
            fieldFlags: "0",
            title: "basketball",
            fieldValue: "",
            fieldType: "Button",
        },
        {
            fieldFlags: "0",
            title: "nascar",
            fieldValue: "",
            fieldType: "Button",
        },
        {
            fieldFlags: "0",
            title: "hockey",
            fieldValue: "",
            fieldType: "Button",
        },
    ];

    const fdf = await pdfFiller.generateFieldJson(source2PDF, null);
    t.deepEqual(fdf, _expected);
});

test("should generate another form field JSON with no errors", async (t) => {
    const fdf = await pdfFiller.generateFieldJson(source1PDF, null);
    t.deepEqual(fdf, expected.test1.form_fields);
});

test("should generate a FDF Template as expected", async (t) => {
    const _expected = {
        last_name: "",
        first_name: "",
        date: "",
        football: "",
        baseball: "",
        basketball: "",
        hockey: "",
        nascar: "",
    };
    const fdf = await pdfFiller.generateFDFTemplate(source2PDF, null);
    t.deepEqual(fdf, _expected);
});

test("should generate another FDF Template with no errors", async (t) => {
    const fdf = await pdfFiller.generateFDFTemplate(source1PDF, null);
    t.deepEqual(fdf, expected.test1.fdfTemplate);
});

test("Should generate an corresponding FDF object", (t) => {
    const _expected = {
        first_name: "John",
        last_name: "Doe",
        date: "Jan 1, 2013",
        football: "Off",
        baseball: "Yes",
        basketball: "Off",
        hockey: "Yes",
        nascar: "Off",
    };

    const _data = [
        {
            title: "first_name",
            fieldfieldType: "Text",
            fieldValue: "John",
        },
        {
            title: "last_name",
            fieldfieldType: "Text",
            fieldValue: "Doe",
        },
        {
            title: "date",
            fieldType: "Text",
            fieldValue: "Jan 1, 2013",
        },
        {
            title: "football",
            fieldType: "Button",
            fieldValue: false,
        },
        {
            title: "baseball",
            fieldType: "Button",
            fieldValue: true,
        },
        {
            title: "basketball",
            fieldType: "Button",
            fieldValue: false,
        },
        {
            title: "hockey",
            fieldType: "Button",
            fieldValue: true,
        },
        {
            title: "nascar",
            fieldType: "Button",
            fieldValue: false,
        },
    ];

    const FDFData = pdfFiller.convFieldJson2FDF(_data);
    t.deepEqual(FDFData, _expected);
});

test("Should convert formJson to FDF data as expected", (t) => {
    const _convMap = {
        lastName: "last_name",
        firstName: "first_name",
        Date: "date",
        footballField: "football",
        baseballField: "baseball",
        bballField: "basketball",
        hockeyField: "hockey",
        nascarField: "nascar",
    };

    const _data = [
        {
            title: "lastName",
            fieldfieldType: "Text",
            fieldValue: "John",
        },
        {
            title: "firstName",
            fieldfieldType: "Text",
            fieldValue: "Doe",
        },
        {
            title: "Date",
            fieldType: "Text",
            fieldValue: "Jan 1, 2013",
        },
        {
            title: "footballField",
            fieldType: "Button",
            fieldValue: false,
        },
        {
            title: "baseballField",
            fieldType: "Button",
            fieldValue: true,
        },
        {
            title: "bballField",
            fieldType: "Button",
            fieldValue: false,
        },
        {
            title: "hockeyField",
            fieldType: "Button",
            fieldValue: true,
        },
        {
            title: "nascarField",
            fieldType: "Button",
            fieldValue: false,
        },
    ];

    const _expected = {
        last_name: "John",
        first_name: "Doe",
        date: "Jan 1, 2013",
        football: "Off",
        baseball: "Yes",
        basketball: "Off",
        hockey: "Yes",
        nascar: "Off",
    };
    const convertedFDF = pdfFiller.mapForm2PDF(_data, _convMap);
    t.deepEqual(convertedFDF, _expected);
});
