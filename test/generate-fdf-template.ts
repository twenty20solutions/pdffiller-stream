import test from "ava";
import generateFdfTemplate from "../src/generate-fdf-template";

// @ts-expect-error I'm not making types for this
import { fdfTemplate } from "./_expected-data.js";

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
    const fdf = await generateFdfTemplate(sourcePDF);
    t.deepEqual(fdf, expected);
});

test("should generate a large FDF Template with no errors", async (t) => {
    const fdf = await generateFdfTemplate(source2PDF);
    t.deepEqual(fdf, fdfTemplate);
});
