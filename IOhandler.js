/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: 2/21/2024
 * Author: Raymond Nguyen
 *
 */

const { pipeline } = require("stream/promises");

const yauzl = require("yauzl-promise"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path")


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        try {
          await fs.promises.mkdir(`${pathOut}/${entry.filename}`, { recursive: true });
        } catch (error) {
          if (error.code !== 'EEXIST') {
            throw error;
          }
        }
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
    console.log("Extraction operation complete");
  }
};



/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
  console.log("Reading Directory");
  return new Promise((resolve, reject) => {
    const pngArr = [];

    fs.promises.readdir(dir)
      .then((files) => {
        files.forEach(file => {
          if (path.extname(file) === ".png") {
            pngArr.push(file);
          }
        });
        resolve(pngArr);
      })
      .catch((err) => {
        reject(err);
      });
  });
};


/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  console.log("Filtering Images");
  fs.createReadStream(path.join(__dirname, "unzipped", pathIn))
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;

          const grayscale = 0.299 * this.data[idx] + 0.587 * this.data[idx + 1] + 0.114 * this.data[idx + 2];
          this.data[idx] = this.data[idx + 1] = this.data[idx + 2] = grayscale;
        }
      }

      this.pack().pipe(fs.createWriteStream(`${pathOut}/${pathIn}`));
    });
};


module.exports = {
  unzip,
  readDir,
  grayScale,
};
