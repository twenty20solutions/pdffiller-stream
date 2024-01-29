# PDF Filler Stream

[![npm version](https://badge.fury.io/js/%40dbeaulieu%2Fpdffiller.svg)]

> This is a fork of the [pdf-filler](https://github.com/Sparticuz/pdffiller-stream) great package. Modified to support both ESM and CommonJS and also support accents when filling out the forms.

A node.js PDF form field data filler and FDF generator toolkit. This essentially is a wrapper around the java PDF Toolkit library [pdftk-java](https://gitlab.com/pdftk-java/pdftk).

## Quick start

**You must first have `pdftk` (from pdftk-java, found [here](https://gitlab.com/pdftk-java/pdftk)) installed correctly on your platform.**

Then, install this library:

```bash
npm install @dbeaulieu/pdffiller --save
```

## Examples

#### 1.Fill PDF with existing FDF Data

```javascript
import fillForm from "@dbeaulieu/pdffiller";

const sourcePDF = "test/test.pdf";

const data = {
  last_name: "John",
  first_name: "Doe",
  date: "Jan 1, 2013",
  football: "Off",
  baseball: "Yes",
  basketball: "Off",
  hockey: "Yes",
  nascar: "Off",
};

const output = await fillForm(sourcePDF, data);
// output will be instance of stream.Readable
```

This will take the test.pdf, fill the fields with the data values and stream a filled in, read-only PDF.

A chainable convenience method `toFile` is attached to the response, if you simply wish to write the stream to a file with no fuss:

```javascript
fillForm(sourcePDF, data)
  .toFile("outputFile.PDF")
  .then(() => {
    // your file has been written
  })
  .catch((err) => {
    console.log(err);
  });
```

You could also stream the resulting data directly to AWS, doing something like this with an instantiated `s3` client:

```javascript
fillForm(sourcePDF, data)
  .then((outputStream) => {
    const Body = outputStream;
    const Bucket = "some-bucket";
    const Key = "myFancyNewFilledPDF";
    const ContentType = "application/pdf";

    const uploader = new AWS.S3.ManagedUpload({
      params: { Bucket, Key, Body, ContentType },
      service: s3,
    });

    uploader.promise().then((data) => {
      /* do something with AWS response */
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

Calling `fillForm()` with `shouldFlatten = false` will leave any unmapped fields still editable, as per the `pdftk` command specification.

```javascript

const shouldFlatten = false;

fillForm(sourcePDF, data, shouldFlatten)
    .then((outputStream) {
        // etc, same as above
    })
```

#### 2. Generate FDF Template from PDF

```javascript
import { generateFDFTemplate } from "@dbeaulieu/pdffiller";

const sourcePDF = "test/test.pdf";

const FDF_data = generateFDFTemplate(sourcePDF)
  .then((fdfData) => {
    console.log(fdfData);
  })
  .catch((err) => {
    console.log(err);
  });
```

This will print out this

```json
{
  "last_name": "",
  "first_name": "",
  "date": "",
  "football": "",
  "baseball": "",
  "basketball": "",
  "hockey": "",
  "nascar": ""
}
```

#### 3. Map form fields to PDF fields

```javascript
import { mapForm2PDF } from "@dbeaulieu/pdffiller";

const conversionMap = {
  lastName: "last_name",
  firstName: "first_name",
  Date: "date",
  footballField: "football",
  baseballField: "baseball",
  bballField: "basketball",
  hockeyField: "hockey",
  nascarField: "nascar",
};

const FormFields = {
  lastName: "John",
  firstName: "Doe",
  Date: "Jan 1, 2013",
  footballField: "Off",
  baseballField: "Yes",
  bballField: "Off",
  hockeyField: "Yes",
  nascarField: "Off",
};

mapForm2PDF(data, convMap).then((mappedFields) => {
  console.log(mappedFields);
});
```

This will print out the object below.

```json
{
  "last_name": "John",
  "first_name": "Doe",
  "date": "Jan 1, 2013",
  "football": "Off",
  "baseball": "Yes",
  "basketball": "Off",
  "hockey": "Yes",
  "nascar": "Off"
}
```

#### 4. Convert fieldJson to FDF data

```javascript
import { convFieldJson2FDF } from '@dbeaulieu/pdffiller';

const fieldJson = [
    {
        "title" : "last_name",
        "fieldfieldType": "Text",
        "fieldValue": "Doe"
    },
    {
        "title" : "first_name",
        "fieldfieldType": "Text",
        "fieldValue": "John"
    },
    {
        "title" : "date",
        "fieldType": "Text",
        "fieldValue": "Jan 1, 2013"
    },
    {
        "title" : "football",
        "fieldType": "Button",
        "fieldValue": false
    },
    {
        "title" : "baseball",
        "fieldType": "Button",
        "fieldValue": true
    },
    {
        "title" : "basketball",
        "fieldType": "Button"
        "fieldValue": false
    },
    {
        "title" : "hockey",
        "fieldType": "Button"
        "fieldValue": true
    },
    {
        "title" : "nascar",
        "fieldType": "Button"
        "fieldValue": false
    }
];


const FDFData = convFieldJson2FDF(data);

console.log(FDFData)
```

This will print out:

```json
{
    "last_name" : "John",
    "first_name" : "Doe",
    "date" : "Jan 1, 2013",
    "football" : "Off",
    "baseball" : "Yes",
    "basketball" : "Off",
    "hockey" : "Yes",
    "nascar" : "Off"
};
```
