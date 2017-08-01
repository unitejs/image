/**
 * ICO class for manipulating ICO images.
 */
import * as Jimp from "jimp";
import { ParameterValidation } from "unitejs-framework/dist/helpers/parameterValidation";
import { IDisplay } from "unitejs-framework/dist/interfaces/IDisplay";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";

export class ICO {
    public async fromPngs(display: IDisplay,
                          fileSystem: IFileSystem,
                          sourceFolder: string,
                          sourceFiles: string[],
                          destFolder: string,
                          destFile: string): Promise<number> {

        try {
            display.info("Converting PNGs to ICO");

            if (!ParameterValidation.notEmpty(display, "sourceFolder", sourceFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "sourceFiles", sourceFiles)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFolder", destFolder)) {
                return 1;
            }

            if (!ParameterValidation.notEmpty(display, "destFile", destFile)) {
                return 1;
            }

            const imageData: Jimp[] = [];
            for (let i = 0; i < sourceFiles.length; i++) {
                const j = await Jimp.read(fileSystem.pathCombine(sourceFolder, sourceFiles[i]));
                imageData.push(j);
            }
            const icoData = this.imagesToIco(imageData);

            await fileSystem.fileWriteBinary(destFolder, destFile, icoData);

            return 0;
        } catch (e) {
            display.error("Conversion failed", e);
            return 1;
        }
    }

    private imagesToIco(images: Jimp[]): Buffer {
        const header = this.getHeader(images.length);
        const headerAndIconDir = [header];
        const imageDataArr: Buffer[] = [];

        let len = header.length;
        let offset = header.length + (images.length * 16);

        images.forEach(img => {
            const dir = this.getDir(img, offset);
            const bmpInfoHeader = this.getBmpInfoHeader(img, 0);
            const dib = this.getDib(img);

            headerAndIconDir.push(dir);
            imageDataArr.push(bmpInfoHeader, dib);

            len += dir.length + bmpInfoHeader.length + dib.length;
            offset += bmpInfoHeader.length + dib.length;
        });

        return Buffer.concat(headerAndIconDir.concat(imageDataArr), len);
    }

    // https://en.wikipedia.org/wiki/ICO_(file_format)
    private getHeader(numOfImages: number): Buffer {
        const buf = Buffer.alloc(6);

        buf.writeUInt16LE(0, 0); // Reserved. Must always be 0.
        buf.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image
        buf.writeUInt16LE(numOfImages, 4); // Specifies number of images in the file.

        return buf;
    }

    private getDir(img: Jimp, offset: number): Buffer {
        const buf = Buffer.alloc(16);
        const bitmap = img.bitmap;
        const size = bitmap.data.length + 40;
        const width = bitmap.width >= 256 ? 0 : bitmap.width;
        const height = width;
        const bpp = 32;

        buf.writeUInt8(width, 0); // Specifies image width in pixels.
        buf.writeUInt8(height, 1); // Specifies image height in pixels.
        buf.writeUInt8(0, 2); // Should be 0 if the image does not use a color palette.
        buf.writeUInt8(0, 3); // Reserved. Should be 0.
        buf.writeUInt16LE(0, 4); // Specifies color planes. Should be 0 or 1.
        buf.writeUInt16LE(bpp, 6); // Specifies bits per pixel.
        buf.writeUInt32LE(size, 8); // Specifies the size of the image's data in bytes
        buf.writeUInt32LE(offset, 12); // Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file

        return buf;
    }

    // https://en.wikipedia.org/wiki/BMP_file_format
    private getBmpInfoHeader(img: Jimp, compressionMode: number): Buffer {
        const buf = Buffer.alloc(40);
        const bitmap = img.bitmap;
        const size = bitmap.data.length;
        const width = bitmap.width;
        // https://en.wikipedia.org/wiki/ICO_(file_format)
        // ...Even if the AND mask is not supplied,
        // if the image is in Windows BMP format,
        // the BMP header must still specify a doubled height.
        const height = compressionMode === 0 ? width * 2 : width;
        const bpp = 32;

        buf.writeUInt32LE(40, 0); // The size of this header (40 bytes)
        buf.writeInt32LE(width, 4); // The bitmap width in pixels (signed integer)
        buf.writeInt32LE(height, 8); // The bitmap height in pixels (signed integer)
        buf.writeUInt16LE(1, 12); // The number of color planes (must be 1)
        buf.writeUInt16LE(bpp, 14); // The number of bits per pixel
        buf.writeUInt32LE(compressionMode, 16); // The compression method being used.
        buf.writeUInt32LE(size, 20); // The image size.
        buf.writeInt32LE(0, 24); // The horizontal resolution of the image. (signed integer)
        buf.writeInt32LE(0, 28); // The horizontal resolution of the image. (signed integer)
        buf.writeUInt32LE(0, 32); // The number of colors in the color palette, or 0 to default to 2n
        buf.writeUInt32LE(0, 36); // 	The number of important colors used, or 0 when every color is important; generally ignored.

        return buf;
    }

    // https://en.wikipedia.org/wiki/BMP_file_format
    // Note that the bitmap data starts with the lower left hand corner of the image.
    // blue green red alpha in order
    private getDib(img: Jimp): Buffer {
        const bitmap = img.bitmap;
        const size = bitmap.data.length;
        const buf = Buffer.alloc(size);
        const width = bitmap.width;
        const height = width;
        const lowerLeftPos = (height - 1) * width * 4;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const pxColor = img.getPixelColor(x, y);

                const r = pxColor >> 24 & 255;
                const g = pxColor >> 16 & 255;
                const b = pxColor >> 8 & 255;
                const a = pxColor & 255;

                const bmpPos = lowerLeftPos - y * width * 4 + x * 4;

                buf.writeUInt8(b, bmpPos);
                buf.writeUInt8(g, bmpPos + 1);
                buf.writeUInt8(r, bmpPos + 2);
                buf.writeUInt8(a, bmpPos + 3);
            }
        }

        return buf;
    }
}
