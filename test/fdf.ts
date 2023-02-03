import test from "ava";
import createFdf from "../src/fdf.js";

test("should create a FDF template and not error with a null value", (t) => {
  const fdfData = createFdf({
    baseball: "Yes",
    basketball: "Off",
    date: "Jan 1, 2013",
    first_name: "1) John",
    football: "Off",
    hockey: "Yes",
    last_name: "Doe",
    nascar: "Off",
    // eslint-disable-next-line unicorn/no-null
    nulval: null,
    udfval: undefined,
  });
  t.assert(fdfData);
});
