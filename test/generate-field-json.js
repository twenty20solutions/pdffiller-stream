const test = require("ava");
const generateFieldJson = require("../dist/generate-field-json").default;
const { formFields } = require("./_expected-data");

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

test("should generate form field JSON as expected", async (t) => {
    const expected = [
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: [],
            fieldType: "Text",
            fieldValue: "",
            title: "first_name",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: [],
            fieldType: "Text",
            fieldValue: "",
            title: "last_name",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: [],
            fieldType: "Text",
            fieldValue: "",
            title: "date",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: ["Off", "Yes"],
            fieldType: "Button",
            fieldValue: "",
            title: "football",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: ["Off", "Yes"],
            fieldType: "Button",
            fieldValue: "",
            title: "baseball",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: [],
            fieldType: "Button",
            fieldValue: "",
            title: "basketball",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: ["Off", "Yes"],
            fieldType: "Button",
            fieldValue: "",
            title: "nascar",
        },
        {
            fieldDefault: "",
            fieldFlags: "0",
            fieldMaxLength: "",
            fieldOptions: ["Off", "Yes"],
            fieldType: "Button",
            fieldValue: "",
            title: "hockey",
        },
    ];

    const fdf = await generateFieldJson(sourcePDF);
    t.deepEqual(fdf, expected);
});

test("should generate a large form field JSON with no errors", async (t) => {
    const fdf = await generateFieldJson(source2PDF);
    t.deepEqual(fdf, formFields);
});
