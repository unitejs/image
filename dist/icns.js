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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pY25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTs7R0FFRztBQUNILDZCQUE2QjtBQUM3Qiw0RkFBeUY7QUFHekYsZ0ZBQTZFO0FBRTdFO0lBQ2lCLE9BQU8sQ0FBQyxNQUFlLEVBQ2YsVUFBdUIsRUFDdkIsWUFBdUMsRUFDdkMsVUFBcUMsRUFDckMsVUFBcUMsRUFDckMsUUFBZ0I7O1lBRWpDLElBQUksQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMxQyw2QkFBYSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO29CQUN2RCxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbEQsTUFBTSxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO29CQUN2RCxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyx5Q0FBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQztnQkFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLHlDQUFtQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDYixDQUFDO2dCQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMseUNBQW1CLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLENBQUM7Z0JBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyx5Q0FBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlELE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQztnQkFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUVyRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNULE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNyRSxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFFakQsTUFBTSxTQUFTLEdBQUcsTUFBTSxVQUFVLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDNUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2QixNQUFNLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzt3QkFFNUQsRUFBRSxDQUFDLENBQUMsWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQzdCLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDYixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7NEJBQzlELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUU3RSxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQ0FDYixNQUFNLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7NEJBQ2pELENBQUM7NEJBQ0QsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQ2pFLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2IsQ0FBQztvQkFDTCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQzt3QkFDNUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDYixDQUFDO2dCQUNMLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO29CQUM1QyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNiLENBQUM7WUFDTCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUVhLFdBQVcsQ0FBQyxNQUFlLEVBQUUsV0FBaUI7O1lBQ3hELHdEQUF3RDtZQUN4RCw2REFBNkQ7WUFDN0QsTUFBTSxVQUFVLEdBQUc7Z0JBQ2YsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtnQkFDdEMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtnQkFDekMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtnQkFDekMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDL0MsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDM0MsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDM0MsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtnQkFDOUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTthQUNqRCxDQUFDO1lBRUYsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFeEQsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZHLENBQUM7WUFFRCw4Q0FBOEM7WUFDOUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQztLQUFBO0lBRWEsV0FBVyxDQUFDLFdBQWlCLEVBQUUsU0FBaUIsRUFBRSxJQUFZLEVBQUUsSUFBWTs7WUFDdEYsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMzQyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3ZDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUU5QixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQ2pELDhEQUE4RDtvQkFDOUQsTUFBTSxVQUFVLEdBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMxQixVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUVoRCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNwSCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUFBO0NBQ0o7QUF4SEQsb0JBd0hDIiwiZmlsZSI6ImljbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIElDTlMgY2xhc3MgZm9yIG1hbmlwdWxhdGluZyBhcHBsZSBpY25zIGltYWdlcy5cbiAqL1xuaW1wb3J0ICogYXMgSmltcCBmcm9tIFwiamltcFwiO1xuaW1wb3J0IHsgUGFyYW1ldGVyVmFsaWRhdGlvbiB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2hlbHBlcnMvcGFyYW1ldGVyVmFsaWRhdGlvblwiO1xuaW1wb3J0IHsgSUZpbGVTeXN0ZW0gfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lGaWxlU3lzdGVtXCI7XG5pbXBvcnQgeyBJTG9nZ2VyIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaW50ZXJmYWNlcy9JTG9nZ2VyXCI7XG5pbXBvcnQgeyBEZWZhdWx0TG9nZ2VyIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvbG9nZ2Vycy9kZWZhdWx0TG9nZ2VyXCI7XG5cbmV4cG9ydCBjbGFzcyBJQ05TIHtcbiAgICBwdWJsaWMgYXN5bmMgZnJvbVBuZyhsb2dnZXI6IElMb2dnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRm9sZGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBkZXN0RmlsZTogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGxvZ2dlciA9PT0gdW5kZWZpbmVkIHx8IGxvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIERlZmF1bHRMb2dnZXIubG9nKFwiVW5hYmxlIHRvIGNvbnRpbnVlIHdpdGhvdXQgbG9nZ2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbSA9PT0gdW5kZWZpbmVkIHx8IGZpbGVTeXN0ZW0gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gY29udGludWUgd2l0aG91dCBmaWxlIHN5c3RlbVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVcIiwgc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0Rm9sZGVyXCIsIGRlc3RGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZpbGVcIiwgZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZmlsZUV4aXN0cyhzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlSW1hZ2UgPSBmaWxlU3lzdGVtLnBhdGhDb21iaW5lKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJSZWFkaW5nIFNvdXJjZSBQTkdcIiwgW3NvdXJjZUltYWdlXSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwbmdCdWZmZXIgPSBhd2FpdCBmaWxlU3lzdGVtLmZpbGVSZWFkQmluYXJ5KHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKHBuZ0J1ZmZlci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBuZ0ltYWdlRGF0YSA9IGF3YWl0IEppbXAucmVhZChuZXcgQnVmZmVyKHBuZ0J1ZmZlcikpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwbmdJbWFnZURhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgcmVhZGluZyBzb3VyY2UgaW1hZ2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGljbnNEYXRhID0gYXdhaXQgdGhpcy5pbWFnZVRvSWNucyhsb2dnZXIsIHBuZ0ltYWdlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbyhcIldyaXRpbmcgSUNOUyBcIiwgW2ZpbGVTeXN0ZW0ucGF0aENvbWJpbmUoZGVzdEZvbGRlciwgZGVzdEZpbGUpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpckV4aXN0cyA9IGF3YWl0IGZpbGVTeXN0ZW0uZGlyZWN0b3J5RXhpc3RzKGRlc3RGb2xkZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXJFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmRpcmVjdG9yeUNyZWF0ZShkZXN0Rm9sZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVdyaXRlQmluYXJ5KGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBpY25zRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlNvdXJjZSBJbWFnZSBpcyB6ZXJvIGxlbmd0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJTb3VyY2UgSW1hZ2UgZG9lcyBub3QgZXhpc3RcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvbnZlcnNpb24gZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGltYWdlVG9JY25zKGxvZ2dlcjogSUxvZ2dlciwgc291cmNlSW1hZ2U6IEppbXApOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BcHBsZV9JY29uX0ltYWdlX2Zvcm1hdFxuICAgICAgICAvLyBXZSBvbmx5IHN1cHBvcnQgdGhlIG5ldyBpbWFnZSBmb3JtYXRzIHRoZSB1c2UgZW1iZWRkZWQgcG5nXG4gICAgICAgIGNvbnN0IGljbnNJbWFnZXMgPSBbXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWNwNFwiLCBzaXplOiAxNiwgaW5mbzogXCIxNlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWNwNVwiLCBzaXplOiAzMiwgaW5mbzogXCIzMngzMlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWNwNlwiLCBzaXplOiA2NCwgaW5mbzogXCI2NHg2NFwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMwN1wiLCBzaXplOiAxMjgsIGluZm86IFwiMTI4eDEyOFwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMwOFwiLCBzaXplOiAyNTYsIGluZm86IFwiMjU2eDI1NlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMwOVwiLCBzaXplOiA1MTIsIGluZm86IFwiNTEyeDUxMlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMxMFwiLCBzaXplOiAxMDI0LCBpbmZvOiBcIjUxMng1MTJAMlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMxMVwiLCBzaXplOiAzMiwgaW5mbzogXCIxNngxNkAyXCIgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJpYzEyXCIsIHNpemU6IDY0LCBpbmZvOiBcIjMyeDMyQDJcIiB9LFxuICAgICAgICAgICAgeyB0eXBlOiBcImljMTNcIiwgc2l6ZTogMjU2LCBpbmZvOiBcIjEyOHgxMjhAMlwiIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiaWMxNFwiLCBzaXplOiA1MTIsIGluZm86IFwiMjU2eDI1NkAyXCIgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGxldCBvdXRCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOCwgMCk7XG4gICAgICAgIG91dEJ1ZmZlci53cml0ZShcImljbnNcIiwgMCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpY25zSW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcIkNyZWF0aW5nIFN1YiBJbWFnZVwiLCBbaWNuc0ltYWdlc1tpXS5pbmZvXSk7XG5cbiAgICAgICAgICAgIG91dEJ1ZmZlciA9IGF3YWl0IHRoaXMuYXBwZW5kQ2h1bmsoc291cmNlSW1hZ2UsIG91dEJ1ZmZlciwgaWNuc0ltYWdlc1tpXS50eXBlLCBpY25zSW1hZ2VzW2ldLnNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV3JpdGUgdG90YWwgZmlsZSBzaXplIGF0IG9mZnNldCA0IG9mIG91dHB1dFxuICAgICAgICBvdXRCdWZmZXIud3JpdGVVSW50MzJCRShvdXRCdWZmZXIubGVuZ3RoLCA0KTtcblxuICAgICAgICByZXR1cm4gb3V0QnVmZmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYXBwZW5kQ2h1bmsoc291cmNlSW1hZ2U6IEppbXAsIG91dEJ1ZmZlcjogQnVmZmVyLCB0eXBlOiBzdHJpbmcsIHNpemU6IG51bWJlcik6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNodW5rSW1hZ2UgPSBzb3VyY2VJbWFnZS5jbG9uZSgpO1xuICAgICAgICAgICAgY2h1bmtJbWFnZS5yZXNpemUoc2l6ZSwgc2l6ZSk7XG5cbiAgICAgICAgICAgIGNodW5rSW1hZ2UuZ2V0QnVmZmVyKEppbXAuTUlNRV9QTkcsIChlcnIsIHBuZ0RhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJY29uIGhlYWRlciwgJ3R5cGUnICsgKGxlbmd0aCBvZiBpY29uICsgaWNvbiBoZWFkZXIgbGVuZ3RoKVxuICAgICAgICAgICAgICAgIGNvbnN0IGljb25IZWFkZXI6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4LCAwKTtcbiAgICAgICAgICAgICAgICBpY29uSGVhZGVyLndyaXRlKHR5cGUsIDApO1xuICAgICAgICAgICAgICAgIGljb25IZWFkZXIud3JpdGVVSW50MzJCRShwbmdEYXRhLmxlbmd0aCArIDgsIDQpO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShCdWZmZXIuY29uY2F0KFtvdXRCdWZmZXIsIGljb25IZWFkZXIsIHBuZ0RhdGFdLCBvdXRCdWZmZXIubGVuZ3RoICsgaWNvbkhlYWRlci5sZW5ndGggKyBwbmdEYXRhLmxlbmd0aCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
