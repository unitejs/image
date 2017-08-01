"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ICO class for manipulating ICO images.
 */
const Jimp = require("jimp");
const parameterValidation_1 = require("unitejs-framework/dist/helpers/parameterValidation");
class ICO {
    fromPngs(display, fileSystem, sourceFolder, sourceFiles, destFolder, destFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                display.info("Converting PNGs to ICO");
                if (!parameterValidation_1.ParameterValidation.notEmpty(display, "sourceFolder", sourceFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(display, "sourceFiles", sourceFiles)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(display, "destFolder", destFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(display, "destFile", destFile)) {
                    return 1;
                }
                const imageData = [];
                for (let i = 0; i < sourceFiles.length; i++) {
                    const j = yield Jimp.read(fileSystem.pathCombine(sourceFolder, sourceFiles[i]));
                    imageData.push(j);
                }
                const icoData = this.imagesToIco(imageData);
                yield fileSystem.fileWriteBinary(destFolder, destFile, icoData);
                return 0;
            }
            catch (e) {
                display.error("Conversion failed", e);
                return 1;
            }
        });
    }
    imagesToIco(images) {
        const header = this.getHeader(images.length);
        const headerAndIconDir = [header];
        const imageDataArr = [];
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
    getHeader(numOfImages) {
        const buf = Buffer.alloc(6);
        buf.writeUInt16LE(0, 0); // Reserved. Must always be 0.
        buf.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image
        buf.writeUInt16LE(numOfImages, 4); // Specifies number of images in the file.
        return buf;
    }
    getDir(img, offset) {
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
    getBmpInfoHeader(img, compressionMode) {
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
    getDib(img) {
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
exports.ICO = ICO;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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RXpILE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELGlGQUFpRjtJQUNqRixnQ0FBZ0M7SUFDeEIsTUFBTSxDQUFDLEdBQVM7UUFDcEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDM0IsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE1BQU0sWUFBWSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFOUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUM3QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUM5QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFeEMsTUFBTSxDQUFDLEdBQUcsT0FBTyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUM5QixNQUFNLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLEdBQUcsT0FBTyxHQUFHLEdBQUcsQ0FBQztnQkFFeEIsTUFBTSxNQUFNLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXBELEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQTVKRCxrQkE0SkMiLCJmaWxlIjoiaWNvLmpzIiwic291cmNlUm9vdCI6Ii4uL3NyYyJ9
