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
    fromPngs(logger, fileSystem, sourceFolder, sourceFiles, destFolder, destFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFiles", sourceFiles)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFile", destFile)) {
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
                logger.error("Conversion failed", e);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDLENBQUM7Z0JBQzFCLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDOUIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBMUpELGtCQTBKQyIsImZpbGUiOiJpY28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIElDTyBjbGFzcyBmb3IgbWFuaXB1bGF0aW5nIElDTyBpbWFnZXMuXG4gKi9cbmltcG9ydCAqIGFzIEppbXAgZnJvbSBcImppbXBcIjtcbmltcG9ydCB7IFBhcmFtZXRlclZhbGlkYXRpb24gfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9oZWxwZXJzL3BhcmFtZXRlclZhbGlkYXRpb25cIjtcbmltcG9ydCB7IElGaWxlU3lzdGVtIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaW50ZXJmYWNlcy9JRmlsZVN5c3RlbVwiO1xuaW1wb3J0IHsgSUxvZ2dlciB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUxvZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgSUNPIHtcbiAgICBwdWJsaWMgYXN5bmMgZnJvbVBuZ3MobG9nZ2VyOiBJTG9nZ2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtOiBJRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRm9sZGVyOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGVzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0RmlsZTogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVzXCIsIHNvdXJjZUZpbGVzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGb2xkZXJcIiwgZGVzdEZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0RmlsZVwiLCBkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaW1hZ2VEYXRhOiBKaW1wW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlRmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBqID0gYXdhaXQgSmltcC5yZWFkKGZpbGVTeXN0ZW0ucGF0aENvbWJpbmUoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlc1tpXSkpO1xuICAgICAgICAgICAgICAgIGltYWdlRGF0YS5wdXNoKGopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgaWNvRGF0YSA9IHRoaXMuaW1hZ2VzVG9JY28oaW1hZ2VEYXRhKTtcblxuICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5maWxlV3JpdGVCaW5hcnkoZGVzdEZvbGRlciwgZGVzdEZpbGUsIGljb0RhdGEpO1xuXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ29udmVyc2lvbiBmYWlsZWRcIiwgZSk7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaW1hZ2VzVG9JY28oaW1hZ2VzOiBKaW1wW10pOiBCdWZmZXIge1xuICAgICAgICBjb25zdCBoZWFkZXIgPSB0aGlzLmdldEhlYWRlcihpbWFnZXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgaGVhZGVyQW5kSWNvbkRpciA9IFtoZWFkZXJdO1xuICAgICAgICBjb25zdCBpbWFnZURhdGFBcnI6IEJ1ZmZlcltdID0gW107XG5cbiAgICAgICAgbGV0IGxlbiA9IGhlYWRlci5sZW5ndGg7XG4gICAgICAgIGxldCBvZmZzZXQgPSBoZWFkZXIubGVuZ3RoICsgKGltYWdlcy5sZW5ndGggKiAxNik7XG5cbiAgICAgICAgaW1hZ2VzLmZvckVhY2goaW1nID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9IHRoaXMuZ2V0RGlyKGltZywgb2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnN0IGJtcEluZm9IZWFkZXIgPSB0aGlzLmdldEJtcEluZm9IZWFkZXIoaW1nLCAwKTtcbiAgICAgICAgICAgIGNvbnN0IGRpYiA9IHRoaXMuZ2V0RGliKGltZyk7XG5cbiAgICAgICAgICAgIGhlYWRlckFuZEljb25EaXIucHVzaChkaXIpO1xuICAgICAgICAgICAgaW1hZ2VEYXRhQXJyLnB1c2goYm1wSW5mb0hlYWRlciwgZGliKTtcblxuICAgICAgICAgICAgbGVuICs9IGRpci5sZW5ndGggKyBibXBJbmZvSGVhZGVyLmxlbmd0aCArIGRpYi5sZW5ndGg7XG4gICAgICAgICAgICBvZmZzZXQgKz0gYm1wSW5mb0hlYWRlci5sZW5ndGggKyBkaWIubGVuZ3RoO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChoZWFkZXJBbmRJY29uRGlyLmNvbmNhdChpbWFnZURhdGFBcnIpLCBsZW4pO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lDT18oZmlsZV9mb3JtYXQpXG4gICAgcHJpdmF0ZSBnZXRIZWFkZXIobnVtT2ZJbWFnZXM6IG51bWJlcik6IEJ1ZmZlciB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvYyg2KTtcblxuICAgICAgICBidWYud3JpdGVVSW50MTZMRSgwLCAwKTsgLy8gUmVzZXJ2ZWQuIE11c3QgYWx3YXlzIGJlIDAuXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQxNkxFKDEsIDIpOyAvLyBTcGVjaWZpZXMgaW1hZ2UgdHlwZTogMSBmb3IgaWNvbiAoLklDTykgaW1hZ2VcbiAgICAgICAgYnVmLndyaXRlVUludDE2TEUobnVtT2ZJbWFnZXMsIDQpOyAvLyBTcGVjaWZpZXMgbnVtYmVyIG9mIGltYWdlcyBpbiB0aGUgZmlsZS5cblxuICAgICAgICByZXR1cm4gYnVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RGlyKGltZzogSmltcCwgb2Zmc2V0OiBudW1iZXIpOiBCdWZmZXIge1xuICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuYWxsb2MoMTYpO1xuICAgICAgICBjb25zdCBiaXRtYXAgPSBpbWcuYml0bWFwO1xuICAgICAgICBjb25zdCBzaXplID0gYml0bWFwLmRhdGEubGVuZ3RoICsgNDA7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gYml0bWFwLndpZHRoID49IDI1NiA/IDAgOiBiaXRtYXAud2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHdpZHRoO1xuICAgICAgICBjb25zdCBicHAgPSAzMjtcblxuICAgICAgICBidWYud3JpdGVVSW50OCh3aWR0aCwgMCk7IC8vIFNwZWNpZmllcyBpbWFnZSB3aWR0aCBpbiBwaXhlbHMuXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQ4KGhlaWdodCwgMSk7IC8vIFNwZWNpZmllcyBpbWFnZSBoZWlnaHQgaW4gcGl4ZWxzLlxuICAgICAgICBidWYud3JpdGVVSW50OCgwLCAyKTsgLy8gU2hvdWxkIGJlIDAgaWYgdGhlIGltYWdlIGRvZXMgbm90IHVzZSBhIGNvbG9yIHBhbGV0dGUuXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQ4KDAsIDMpOyAvLyBSZXNlcnZlZC4gU2hvdWxkIGJlIDAuXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQxNkxFKDAsIDQpOyAvLyBTcGVjaWZpZXMgY29sb3IgcGxhbmVzLiBTaG91bGQgYmUgMCBvciAxLlxuICAgICAgICBidWYud3JpdGVVSW50MTZMRShicHAsIDYpOyAvLyBTcGVjaWZpZXMgYml0cyBwZXIgcGl4ZWwuXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQzMkxFKHNpemUsIDgpOyAvLyBTcGVjaWZpZXMgdGhlIHNpemUgb2YgdGhlIGltYWdlJ3MgZGF0YSBpbiBieXRlc1xuICAgICAgICBidWYud3JpdGVVSW50MzJMRShvZmZzZXQsIDEyKTsgLy8gU3BlY2lmaWVzIHRoZSBvZmZzZXQgb2YgQk1QIG9yIFBORyBkYXRhIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgSUNPL0NVUiBmaWxlXG5cbiAgICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CTVBfZmlsZV9mb3JtYXRcbiAgICBwcml2YXRlIGdldEJtcEluZm9IZWFkZXIoaW1nOiBKaW1wLCBjb21wcmVzc2lvbk1vZGU6IG51bWJlcik6IEJ1ZmZlciB7XG4gICAgICAgIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvYyg0MCk7XG4gICAgICAgIGNvbnN0IGJpdG1hcCA9IGltZy5iaXRtYXA7XG4gICAgICAgIGNvbnN0IHNpemUgPSBiaXRtYXAuZGF0YS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gYml0bWFwLndpZHRoO1xuICAgICAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JQ09fKGZpbGVfZm9ybWF0KVxuICAgICAgICAvLyAuLi5FdmVuIGlmIHRoZSBBTkQgbWFzayBpcyBub3Qgc3VwcGxpZWQsXG4gICAgICAgIC8vIGlmIHRoZSBpbWFnZSBpcyBpbiBXaW5kb3dzIEJNUCBmb3JtYXQsXG4gICAgICAgIC8vIHRoZSBCTVAgaGVhZGVyIG11c3Qgc3RpbGwgc3BlY2lmeSBhIGRvdWJsZWQgaGVpZ2h0LlxuICAgICAgICBjb25zdCBoZWlnaHQgPSBjb21wcmVzc2lvbk1vZGUgPT09IDAgPyB3aWR0aCAqIDIgOiB3aWR0aDtcbiAgICAgICAgY29uc3QgYnBwID0gMzI7XG5cbiAgICAgICAgYnVmLndyaXRlVUludDMyTEUoNDAsIDApOyAvLyBUaGUgc2l6ZSBvZiB0aGlzIGhlYWRlciAoNDAgYnl0ZXMpXG4gICAgICAgIGJ1Zi53cml0ZUludDMyTEUod2lkdGgsIDQpOyAvLyBUaGUgYml0bWFwIHdpZHRoIGluIHBpeGVscyAoc2lnbmVkIGludGVnZXIpXG4gICAgICAgIGJ1Zi53cml0ZUludDMyTEUoaGVpZ2h0LCA4KTsgLy8gVGhlIGJpdG1hcCBoZWlnaHQgaW4gcGl4ZWxzIChzaWduZWQgaW50ZWdlcilcbiAgICAgICAgYnVmLndyaXRlVUludDE2TEUoMSwgMTIpOyAvLyBUaGUgbnVtYmVyIG9mIGNvbG9yIHBsYW5lcyAobXVzdCBiZSAxKVxuICAgICAgICBidWYud3JpdGVVSW50MTZMRShicHAsIDE0KTsgLy8gVGhlIG51bWJlciBvZiBiaXRzIHBlciBwaXhlbFxuICAgICAgICBidWYud3JpdGVVSW50MzJMRShjb21wcmVzc2lvbk1vZGUsIDE2KTsgLy8gVGhlIGNvbXByZXNzaW9uIG1ldGhvZCBiZWluZyB1c2VkLlxuICAgICAgICBidWYud3JpdGVVSW50MzJMRShzaXplLCAyMCk7IC8vIFRoZSBpbWFnZSBzaXplLlxuICAgICAgICBidWYud3JpdGVJbnQzMkxFKDAsIDI0KTsgLy8gVGhlIGhvcml6b250YWwgcmVzb2x1dGlvbiBvZiB0aGUgaW1hZ2UuIChzaWduZWQgaW50ZWdlcilcbiAgICAgICAgYnVmLndyaXRlSW50MzJMRSgwLCAyOCk7IC8vIFRoZSBob3Jpem9udGFsIHJlc29sdXRpb24gb2YgdGhlIGltYWdlLiAoc2lnbmVkIGludGVnZXIpXG4gICAgICAgIGJ1Zi53cml0ZVVJbnQzMkxFKDAsIDMyKTsgLy8gVGhlIG51bWJlciBvZiBjb2xvcnMgaW4gdGhlIGNvbG9yIHBhbGV0dGUsIG9yIDAgdG8gZGVmYXVsdCB0byAyblxuICAgICAgICBidWYud3JpdGVVSW50MzJMRSgwLCAzNik7IC8vIFx0VGhlIG51bWJlciBvZiBpbXBvcnRhbnQgY29sb3JzIHVzZWQsIG9yIDAgd2hlbiBldmVyeSBjb2xvciBpcyBpbXBvcnRhbnQ7IGdlbmVyYWxseSBpZ25vcmVkLlxuXG4gICAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQk1QX2ZpbGVfZm9ybWF0XG4gICAgLy8gTm90ZSB0aGF0IHRoZSBiaXRtYXAgZGF0YSBzdGFydHMgd2l0aCB0aGUgbG93ZXIgbGVmdCBoYW5kIGNvcm5lciBvZiB0aGUgaW1hZ2UuXG4gICAgLy8gYmx1ZSBncmVlbiByZWQgYWxwaGEgaW4gb3JkZXJcbiAgICBwcml2YXRlIGdldERpYihpbWc6IEppbXApOiBCdWZmZXIge1xuICAgICAgICBjb25zdCBiaXRtYXAgPSBpbWcuYml0bWFwO1xuICAgICAgICBjb25zdCBzaXplID0gYml0bWFwLmRhdGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuYWxsb2Moc2l6ZSk7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gYml0bWFwLndpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB3aWR0aDtcbiAgICAgICAgY29uc3QgbG93ZXJMZWZ0UG9zID0gKGhlaWdodCAtIDEpICogd2lkdGggKiA0O1xuXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHB4Q29sb3IgPSBpbWcuZ2V0UGl4ZWxDb2xvcih4LCB5KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBweENvbG9yID4+IDI0ICYgMjU1O1xuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBweENvbG9yID4+IDE2ICYgMjU1O1xuICAgICAgICAgICAgICAgIGNvbnN0IGIgPSBweENvbG9yID4+IDggJiAyNTU7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9IHB4Q29sb3IgJiAyNTU7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBibXBQb3MgPSBsb3dlckxlZnRQb3MgLSB5ICogd2lkdGggKiA0ICsgeCAqIDQ7XG5cbiAgICAgICAgICAgICAgICBidWYud3JpdGVVSW50OChiLCBibXBQb3MpO1xuICAgICAgICAgICAgICAgIGJ1Zi53cml0ZVVJbnQ4KGcsIGJtcFBvcyArIDEpO1xuICAgICAgICAgICAgICAgIGJ1Zi53cml0ZVVJbnQ4KHIsIGJtcFBvcyArIDIpO1xuICAgICAgICAgICAgICAgIGJ1Zi53cml0ZVVJbnQ4KGEsIGJtcFBvcyArIDMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9XG59XG4iXX0=
