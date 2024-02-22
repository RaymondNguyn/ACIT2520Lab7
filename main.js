const path = require("path");
/*
 * Project: Milestone 1
 * File Name: main.js
 * Description:
 *
 * Created Date: 2/21/2024
 * Author:Raymond Nguyen
 *
 */

const fs = require("fs")
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");


const main = async () => {
    try {
        await fs.promises.mkdir(pathUnzipped, { recursive: true })
            .catch((error) => {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
            });

        await IOhandler.unzip(zipFilePath, pathUnzipped);
        const files = await IOhandler.readDir(pathUnzipped);
        for (const file of files) {
            await IOhandler.grayScale(file, pathProcessed);
        }

        console.log('Grayscale conversion completed successfully.');

    } catch (error) {
        console.error('Error:', error);
    }
};


main();
