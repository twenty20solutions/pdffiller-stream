const test = require("ava");
const { fdfTemplate } = require("./_expected-data");
const generateFDFTemplate = require("../dist/generate-fdf-template").default;

const sourcePDF = "test/test.pdf";
const source2PDF = "test/test1.pdf";

test("should generate a FDF Template as expected", async (t) => {
    const expected = {
        baseball: "",
        basketball: "",
        date: "",
        first_name: "",
        football: "",
        hockey: "",
        last_name: "",
        nascar: "",
    };
    const fdf = await generateFDFTemplate(sourcePDF);
    t.deepEqual(fdf, expected);
});

test("should generate a large FDF Template with no errors", async (t) => {
    const fdf = await generateFDFTemplate(source2PDF);
    t.deepEqual(fdf, fdfTemplate);
});
