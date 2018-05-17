/**
 * ICNS class for manipulating apple icns images.
 */
import * as Jimp from "jimp";
import { ParameterValidation } from "unitejs-framework/dist/helpers/parameterValidation";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
import { DefaultLogger } from "unitejs-framework/dist/loggers/defaultLogger";

export class ICNS {
    public async fromPng(logger: ILogger,
                         fileSystem: IFileSystem,
                         sourceFolder: string | undefined | null,
                         sourceFile: string | undefined | null,
                         destFolder: string | undefined | null,
                         destFile: string): Promise<number> {

        try {
            if (logger === undefined || logger === null) {
                DefaultLogger.log("Unable to continue without logger");
                return 1;
            }

            if (fileSystem === undefined || fileSystem === null) {
                logger.error("Unable to continue without file system");
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                return 1;
            }

            const exists = await fileSystem.fileExists(sourceFolder, sourceFile);

            if (exists) {
                const sourceImage = fileSystem.pathCombine(sourceFolder, sourceFile);
                logger.info("Reading Source PNG", [sourceImage]);

                const pngBuffer = await fileSystem.fileReadBinary(sourceFolder, sourceFile);
                if (pngBuffer.length > 0) {
                    const pngImageData = await Jimp.read(Buffer.from(pngBuffer));

                    if (pngImageData === undefined) {
                        logger.error("Error reading source image");
                        return 1;
                    } else {
                        const icnsData = await this.imageToIcns(logger, pngImageData);
                        logger.info("Writing ICNS ", [fileSystem.pathCombine(destFolder, destFile)]);

                        const dirExists = await fileSystem.directoryExists(destFolder);
                        if (!dirExists) {
                            await fileSystem.directoryCreate(destFolder);
                        }
                        await fileSystem.fileWriteBinary(destFolder, destFile, icnsData);
                        return 0;
                    }
                } else {
                    logger.error("Source Image is zero length");
                    return 1;
                }
            } else {
                logger.error("Source Image does not exist");
                return 1;
            }
        } catch (e) {
            logger.error("Conversion failed", e);
            return 1;
        }
    }

    private async imageToIcns(logger: ILogger, sourceImage: Jimp): Promise<Buffer> {
        // https://en.wikipedia.org/wiki/Apple_Icon_Image_format
        // We only support the new image formats the use embedded png
        const icnsImages = [
            { type: "icp4", size: 16, info: "16" },
            { type: "icp5", size: 32, info: "32x32" },
            { type: "icp6", size: 64, info: "64x64" },
            { type: "ic07", size: 128, info: "128x128" },
            { type: "ic08", size: 256, info: "256x256" },
            { type: "ic09", size: 512, info: "512x512" },
            { type: "ic10", size: 1024, info: "512x512@2" },
            { type: "ic11", size: 32, info: "16x16@2" },
            { type: "ic12", size: 64, info: "32x32@2" },
            { type: "ic13", size: 256, info: "128x128@2" },
            { type: "ic14", size: 512, info: "256x256@2" }
        ];

        let outBuffer = Buffer.alloc(8, 0);
        outBuffer.write("icns", 0);

        for (let i = 0; i < icnsImages.length; i++) {
            logger.info("Creating Sub Image", [icnsImages[i].info]);

            outBuffer = await this.appendChunk(sourceImage, outBuffer, icnsImages[i].type, icnsImages[i].size);
        }

        // Write total file size at offset 4 of output
        outBuffer.writeUInt32BE(outBuffer.length, 4);

        return outBuffer;
    }

    private async appendChunk(sourceImage: Jimp, outBuffer: Buffer, type: string, size: number): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunkImage = sourceImage.clone();
            chunkImage.resize(size, size);

            chunkImage.getBuffer(Jimp.MIME_PNG, (err, pngData) => {
                // Icon header, 'type' + (length of icon + icon header length)
                const iconHeader: Buffer = Buffer.alloc(8, 0);
                iconHeader.write(type, 0);
                iconHeader.writeUInt32BE(pngData.length + 8, 4);

                resolve(Buffer.concat([outBuffer, iconHeader, pngData], outBuffer.length + iconHeader.length + pngData.length));
            });
        });
    }
}
