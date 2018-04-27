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
 * ICNS class for manipulating apple icns images.
 */
const Jimp = require("jimp");
const parameterValidation_1 = require("unitejs-framework/dist/helpers/parameterValidation");
const defaultLogger_1 = require("unitejs-framework/dist/loggers/defaultLogger");
class ICNS {
    fromPng(logger, fileSystem, sourceFolder, sourceFile, destFolder, destFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (logger === undefined || logger === null) {
                    defaultLogger_1.DefaultLogger.log("Unable to continue without logger");
                    return 1;
                }
                if (fileSystem === undefined || fileSystem === null) {
                    logger.error("Unable to continue without file system");
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFolder", sourceFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "sourceFile", sourceFile)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFolder", destFolder)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.notEmpty(logger, "destFile", destFile)) {
                    return 1;
                }
                const exists = yield fileSystem.fileExists(sourceFolder, sourceFile);
                if (exists) {
                    const sourceImage = fileSystem.pathCombine(sourceFolder, sourceFile);
                    logger.info("Reading Source PNG", [sourceImage]);
                    const pngBuffer = yield fileSystem.fileReadBinary(sourceFolder, sourceFile);
                    if (pngBuffer.length > 0) {
                        const pngImageData = yield Jimp.read(new Buffer(pngBuffer));
                        if (pngImageData === undefined) {
                            logger.error("Error reading source image");
                            return 1;
                        }
                        else {
                            const icnsData = yield this.imageToIcns(logger, pngImageData);
                            logger.info("Writing ICNS ", [fileSystem.pathCombine(destFolder, destFile)]);
                            const dirExists = yield fileSystem.directoryExists(destFolder);
                            if (!dirExists) {
                                yield fileSystem.directoryCreate(destFolder);
                            }
                            yield fileSystem.fileWriteBinary(destFolder, destFile, icnsData);
                            return 0;
                        }
                    }
                    else {
                        logger.error("Source Image is zero length");
                        return 1;
                    }
                }
                else {
                    logger.error("Source Image does not exist");
                    return 1;
                }
            }
            catch (e) {
                logger.error("Conversion failed", e);
                return 1;
            }
        });
    }
    imageToIcns(logger, sourceImage) {
        return __awaiter(this, void 0, void 0, function* () {
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
                outBuffer = yield this.appendChunk(sourceImage, outBuffer, icnsImages[i].type, icnsImages[i].size);
            }
            // Write total file size at offset 4 of output
            outBuffer.writeUInt32BE(outBuffer.length, 4);
            return outBuffer;
        });
    }
    appendChunk(sourceImage, outBuffer, type, size) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const chunkImage = sourceImage.clone();
                chunkImage.resize(size, size);
                chunkImage.getBuffer(Jimp.MIME_PNG, (err, pngData) => {
                    // Icon header, 'type' + (length of icon + icon header length)
                    const iconHeader = Buffer.alloc(8, 0);
                    iconHeader.write(type, 0);
                    iconHeader.writeUInt32BE(pngData.length + 8, 4);
                    resolve(Buffer.concat([outBuffer, iconHeader, pngData], outBuffer.length + iconHeader.length + pngData.length));
                });
            });
        });
    }
}
exports.ICNS = ICNS;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pY25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7R0FFRztBQUNILDZCQUE2QjtBQUM3Qiw0RkFBeUY7QUFHekYsZ0ZBQTZFO0FBRTdFO0lBQ2lCLE9BQU8sQ0FBQyxNQUFlLEVBQ2YsVUFBdUIsRUFDdkIsWUFBdUMsRUFDdkMsVUFBcUMsRUFDckMsVUFBcUMsRUFDckMsUUFBZ0I7O1lBRWpDLElBQUk7Z0JBQ0EsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7b0JBQ3pDLDZCQUFhLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7b0JBQ3ZELE9BQU8sQ0FBQyxDQUFDO2lCQUNaO2dCQUVELElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO29CQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7b0JBQ3ZELE9BQU8sQ0FBQyxDQUFDO2lCQUNaO2dCQUVELElBQUksQ0FBQyx5Q0FBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsRUFBRTtvQkFDckUsT0FBTyxDQUFDLENBQUM7aUJBQ1o7Z0JBRUQsSUFBSSxDQUFDLHlDQUFtQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFFO29CQUNqRSxPQUFPLENBQUMsQ0FBQztpQkFDWjtnQkFFRCxJQUFJLENBQUMseUNBQW1CLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLEVBQUU7b0JBQ2pFLE9BQU8sQ0FBQyxDQUFDO2lCQUNaO2dCQUVELElBQUksQ0FBQyx5Q0FBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRTtvQkFDN0QsT0FBTyxDQUFDLENBQUM7aUJBQ1o7Z0JBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFFckUsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBQ3JFLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUVqRCxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUM1RSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUN0QixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFFNUQsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFOzRCQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7NEJBQzNDLE9BQU8sQ0FBQyxDQUFDO3lCQUNaOzZCQUFNOzRCQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7NEJBQzlELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUU3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQy9ELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0NBQ1osTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDOzZCQUNoRDs0QkFDRCxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDakUsT0FBTyxDQUFDLENBQUM7eUJBQ1o7cUJBQ0o7eUJBQU07d0JBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO3dCQUM1QyxPQUFPLENBQUMsQ0FBQztxQkFDWjtpQkFDSjtxQkFBTTtvQkFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7b0JBQzVDLE9BQU8sQ0FBQyxDQUFDO2lCQUNaO2FBQ0o7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLENBQUMsQ0FBQzthQUNaO1FBQ0wsQ0FBQztLQUFBO0lBRWEsV0FBVyxDQUFDLE1BQWUsRUFBRSxXQUFpQjs7WUFDeEQsd0RBQXdEO1lBQ3hELDZEQUE2RDtZQUM3RCxNQUFNLFVBQVUsR0FBRztnQkFDZixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO2dCQUN0QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUN6QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUN6QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dCQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dCQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dCQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUMvQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dCQUMzQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2dCQUMzQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2dCQUM5QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO2FBQ2pELENBQUM7WUFFRixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUV4RCxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEc7WUFFRCw4Q0FBOEM7WUFDOUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTdDLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7S0FBQTtJQUVhLFdBQVcsQ0FBQyxXQUFpQixFQUFFLFNBQWlCLEVBQUUsSUFBWSxFQUFFLElBQVk7O1lBQ3RGLE9BQU8sSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzNDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRTlCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtvQkFDakQsOERBQThEO29CQUM5RCxNQUFNLFVBQVUsR0FBVyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBRWhELE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3BILENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7Q0FDSjtBQXhIRCxvQkF3SEMiLCJmaWxlIjoiaWNucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSUNOUyBjbGFzcyBmb3IgbWFuaXB1bGF0aW5nIGFwcGxlIGljbnMgaW1hZ2VzLlxuICovXG5pbXBvcnQgKiBhcyBKaW1wIGZyb20gXCJqaW1wXCI7XG5pbXBvcnQgeyBQYXJhbWV0ZXJWYWxpZGF0aW9uIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaGVscGVycy9wYXJhbWV0ZXJWYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBJRmlsZVN5c3RlbSB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUZpbGVTeXN0ZW1cIjtcbmltcG9ydCB7IElMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lMb2dnZXJcIjtcbmltcG9ydCB7IERlZmF1bHRMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9sb2dnZXJzL2RlZmF1bHRMb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIElDTlMge1xuICAgIHB1YmxpYyBhc3luYyBmcm9tUG5nKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtOiBJRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGb2xkZXI6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0Rm9sZGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RGaWxlOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAobG9nZ2VyID09PSB1bmRlZmluZWQgfHwgbG9nZ2VyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgRGVmYXVsdExvZ2dlci5sb2coXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBsb2dnZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtID09PSB1bmRlZmluZWQgfHwgZmlsZVN5c3RlbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBjb250aW51ZSB3aXRob3V0IGZpbGUgc3lzdGVtXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZvbGRlclwiLCBzb3VyY2VGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRmlsZVwiLCBzb3VyY2VGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGb2xkZXJcIiwgZGVzdEZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0RmlsZVwiLCBkZXN0RmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlRXhpc3RzKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIGlmIChleGlzdHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VJbWFnZSA9IGZpbGVTeXN0ZW0ucGF0aENvbWJpbmUoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhcIlJlYWRpbmcgU291cmNlIFBOR1wiLCBbc291cmNlSW1hZ2VdKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBuZ0J1ZmZlciA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVJlYWRCaW5hcnkoc291cmNlRm9sZGVyLCBzb3VyY2VGaWxlKTtcbiAgICAgICAgICAgICAgICBpZiAocG5nQnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG5nSW1hZ2VEYXRhID0gYXdhaXQgSmltcC5yZWFkKG5ldyBCdWZmZXIocG5nQnVmZmVyKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBuZ0ltYWdlRGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciByZWFkaW5nIHNvdXJjZSBpbWFnZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWNuc0RhdGEgPSBhd2FpdCB0aGlzLmltYWdlVG9JY25zKGxvZ2dlciwgcG5nSW1hZ2VEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiV3JpdGluZyBJQ05TIFwiLCBbZmlsZVN5c3RlbS5wYXRoQ29tYmluZShkZXN0Rm9sZGVyLCBkZXN0RmlsZSldKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyRXhpc3RzID0gYXdhaXQgZmlsZVN5c3RlbS5kaXJlY3RvcnlFeGlzdHMoZGVzdEZvbGRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5Q3JlYXRlKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS5maWxlV3JpdGVCaW5hcnkoZGVzdEZvbGRlciwgZGVzdEZpbGUsIGljbnNEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiU291cmNlIEltYWdlIGlzIHplcm8gbGVuZ3RoXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlNvdXJjZSBJbWFnZSBkb2VzIG5vdCBleGlzdFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ29udmVyc2lvbiBmYWlsZWRcIiwgZSk7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaW1hZ2VUb0ljbnMobG9nZ2VyOiBJTG9nZ2VyLCBzb3VyY2VJbWFnZTogSmltcCk6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FwcGxlX0ljb25fSW1hZ2VfZm9ybWF0XG4gICAgICAgIC8vIFdlIG9ubHkgc3VwcG9ydCB0aGUgbmV3IGltYWdlIGZvcm1hdHMgdGhlIHVzZSBlbWJlZGRlZCBwbmdcbiAgICAgICAgY29uc3QgaWNuc0ltYWdlcyA9IFtcbiAgICAgICAgICAgIHsgdHlwZTogXCJpY3A0XCIsIHNpemU6IDE2LCBpbmZvOiBcIjE2XCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpY3A1XCIsIHNpemU6IDMyLCBpbmZvOiBcIjMyeDMyXCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpY3A2XCIsIHNpemU6IDY0LCBpbmZvOiBcIjY0eDY0XCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzA3XCIsIHNpemU6IDEyOCwgaW5mbzogXCIxMjh4MTI4XCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzA4XCIsIHNpemU6IDI1NiwgaW5mbzogXCIyNTZ4MjU2XCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzA5XCIsIHNpemU6IDUxMiwgaW5mbzogXCI1MTJ4NTEyXCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzEwXCIsIHNpemU6IDEwMjQsIGluZm86IFwiNTEyeDUxMkAyXCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzExXCIsIHNpemU6IDMyLCBpbmZvOiBcIjE2eDE2QDJcIiB9LFxuICAgICAgICAgICAgeyB0eXBlOiBcImljMTJcIiwgc2l6ZTogNjQsIGluZm86IFwiMzJ4MzJAMlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMxM1wiLCBzaXplOiAyNTYsIGluZm86IFwiMTI4eDEyOEAyXCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzE0XCIsIHNpemU6IDUxMiwgaW5mbzogXCIyNTZ4MjU2QDJcIiB9XG4gICAgICAgIF07XG5cbiAgICAgICAgbGV0IG91dEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4LCAwKTtcbiAgICAgICAgb3V0QnVmZmVyLndyaXRlKFwiaWNuc1wiLCAwKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGljbnNJbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiQ3JlYXRpbmcgU3ViIEltYWdlXCIsIFtpY25zSW1hZ2VzW2ldLmluZm9dKTtcblxuICAgICAgICAgICAgb3V0QnVmZmVyID0gYXdhaXQgdGhpcy5hcHBlbmRDaHVuayhzb3VyY2VJbWFnZSwgb3V0QnVmZmVyLCBpY25zSW1hZ2VzW2ldLnR5cGUsIGljbnNJbWFnZXNbaV0uc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXcml0ZSB0b3RhbCBmaWxlIHNpemUgYXQgb2Zmc2V0IDQgb2Ygb3V0cHV0XG4gICAgICAgIG91dEJ1ZmZlci53cml0ZVVJbnQzMkJFKG91dEJ1ZmZlci5sZW5ndGgsIDQpO1xuXG4gICAgICAgIHJldHVybiBvdXRCdWZmZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhcHBlbmRDaHVuayhzb3VyY2VJbWFnZTogSmltcCwgb3V0QnVmZmVyOiBCdWZmZXIsIHR5cGU6IHN0cmluZywgc2l6ZTogbnVtYmVyKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtJbWFnZSA9IHNvdXJjZUltYWdlLmNsb25lKCk7XG4gICAgICAgICAgICBjaHVua0ltYWdlLnJlc2l6ZShzaXplLCBzaXplKTtcblxuICAgICAgICAgICAgY2h1bmtJbWFnZS5nZXRCdWZmZXIoSmltcC5NSU1FX1BORywgKGVyciwgcG5nRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEljb24gaGVhZGVyLCAndHlwZScgKyAobGVuZ3RoIG9mIGljb24gKyBpY29uIGhlYWRlciBsZW5ndGgpXG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbkhlYWRlcjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDgsIDApO1xuICAgICAgICAgICAgICAgIGljb25IZWFkZXIud3JpdGUodHlwZSwgMCk7XG4gICAgICAgICAgICAgICAgaWNvbkhlYWRlci53cml0ZVVJbnQzMkJFKHBuZ0RhdGEubGVuZ3RoICsgOCwgNCk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKEJ1ZmZlci5jb25jYXQoW291dEJ1ZmZlciwgaWNvbkhlYWRlciwgcG5nRGF0YV0sIG91dEJ1ZmZlci5sZW5ndGggKyBpY29uSGVhZGVyLmxlbmd0aCArIHBuZ0RhdGEubGVuZ3RoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
