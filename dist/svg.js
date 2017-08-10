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
 * SVG class for manipulating SVG images.
 */
const phantom_1 = require("phantom");
const text_encoding_1 = require("text-encoding");
const parameterValidation_1 = require("unitejs-framework/dist/helpers/parameterValidation");
class SVG {
    toPng(logger, fileSystem, sourceFolder, sourceFile, destFolder, destFile, width, height, marginX, marginY, background) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret;
            let phantom;
            try {
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
                if (!parameterValidation_1.ParameterValidation.isNumeric(logger, "width", width)) {
                    return 1;
                }
                if (!parameterValidation_1.ParameterValidation.isNumeric(logger, "height", height)) {
                    return 1;
                }
                if (marginX !== null && marginX !== undefined && marginX.length > 0) {
                    if (!parameterValidation_1.ParameterValidation.isNumeric(logger, "marginX", marginX)) {
                        return 1;
                    }
                }
                else {
                    marginX = "0";
                }
                if (marginY !== null && marginY !== undefined && marginY.length > 0) {
                    if (!parameterValidation_1.ParameterValidation.isNumeric(logger, "marginY", marginY)) {
                        return 1;
                    }
                }
                else {
                    marginY = "0";
                }
                if (background !== null && background !== undefined && background.length > 0) {
                    if (!parameterValidation_1.ParameterValidation.isColor(logger, "background", background)) {
                        return 1;
                    }
                }
                phantom = yield phantom_1.create();
                const page = yield phantom.createPage();
                let style = "* { margin: 0; padding: 0 }";
                if (background && background.length > 0) {
                    style += ` body { background-color: ${background}}`;
                }
                let w = parseFloat(width);
                let h = parseFloat(height);
                const marginXPixels = parseFloat(marginX);
                const marginYPixels = parseFloat(marginY);
                w -= marginXPixels * 2;
                h -= marginYPixels * 2;
                style += ` img { position: absolute; left: ${marginXPixels}px; top: ${marginYPixels}px}`;
                const svgFilename = fileSystem.pathCombine(sourceFolder, sourceFile);
                const content = `<html><style>${style}</style><body><img width="${w}" height="${h}" src=\"file:///${svgFilename}\"/></body></html>`;
                yield page.property("viewportSize", { width, height });
                yield page.property("content", content);
                const base64 = yield page.renderBase64("PNG");
                yield fileSystem.fileWriteBinary(destFolder, destFile, Buffer.from(base64, "base64"));
                ret = 0;
            }
            catch (e) {
                logger.error("Conversion failed", e);
                ret = 1;
            }
            if (phantom) {
                try {
                    phantom.exit();
                }
                catch (e) {
                    // Ignore any errors from the exit
                }
            }
            return ret;
        });
    }
    toMask(logger, fileSystem, sourceFolder, sourceFile, destFolder, destFile) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret;
            try {
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
                const svgData = yield fileSystem.fileReadBinary(sourceFolder, sourceFile);
                let svgText = new text_encoding_1.TextDecoder().decode(svgData);
                svgText = svgText.replace(/fill=\".*?\"/gi, "fill=\"rgb(0,0,0)\"");
                yield fileSystem.fileWriteBinary(destFolder, destFile, new text_encoding_1.TextEncoder().encode(svgText));
                ret = 0;
            }
            catch (e) {
                logger.error("Conversion failed", e);
                ret = 1;
            }
            return ret;
        });
    }
}
exports.SVG = SVG;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFsSkQsa0JBa0pDIiwiZmlsZSI6InN2Zy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU1ZHIGNsYXNzIGZvciBtYW5pcHVsYXRpbmcgU1ZHIGltYWdlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlLCBXZWJQYWdlIH0gZnJvbSBcInBoYW50b21cIjtcbmltcG9ydCB7IFRleHREZWNvZGVyLCBUZXh0RW5jb2RlciB9IGZyb20gXCJ0ZXh0LWVuY29kaW5nXCI7XG5pbXBvcnQgeyBQYXJhbWV0ZXJWYWxpZGF0aW9uIH0gZnJvbSBcInVuaXRlanMtZnJhbWV3b3JrL2Rpc3QvaGVscGVycy9wYXJhbWV0ZXJWYWxpZGF0aW9uXCI7XG5pbXBvcnQgeyBJRmlsZVN5c3RlbSB9IGZyb20gXCJ1bml0ZWpzLWZyYW1ld29yay9kaXN0L2ludGVyZmFjZXMvSUZpbGVTeXN0ZW1cIjtcbmltcG9ydCB7IElMb2dnZXIgfSBmcm9tIFwidW5pdGVqcy1mcmFtZXdvcmsvZGlzdC9pbnRlcmZhY2VzL0lMb2dnZXJcIjtcblxuZXhwb3J0IGNsYXNzIFNWRyB7XG4gICAgcHVibGljIGFzeW5jIHRvUG5nKGxvZ2dlcjogSUxvZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogSUZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VGaWxlOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgIGRlc3RGb2xkZXI6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblg6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luWTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgICAgICBsZXQgcmV0O1xuICAgICAgICBsZXQgcGhhbnRvbTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGb2xkZXJcIiwgc291cmNlRm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcInNvdXJjZUZpbGVcIiwgc291cmNlRmlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJkZXN0Rm9sZGVyXCIsIGRlc3RGb2xkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZpbGVcIiwgZGVzdEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5pc051bWVyaWMobG9nZ2VyLCBcIndpZHRoXCIsIHdpZHRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24uaXNOdW1lcmljKGxvZ2dlciwgXCJoZWlnaHRcIiwgaGVpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWFyZ2luWCAhPT0gbnVsbCAmJiBtYXJnaW5YICE9PSB1bmRlZmluZWQgJiYgbWFyZ2luWC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLmlzTnVtZXJpYyhsb2dnZXIsIFwibWFyZ2luWFwiLCBtYXJnaW5YKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hcmdpblggPSBcIjBcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1hcmdpblkgIT09IG51bGwgJiYgbWFyZ2luWSAhPT0gdW5kZWZpbmVkICYmIG1hcmdpblkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5pc051bWVyaWMobG9nZ2VyLCBcIm1hcmdpbllcIiwgbWFyZ2luWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXJnaW5ZID0gXCIwXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiYWNrZ3JvdW5kICE9PSBudWxsICYmIGJhY2tncm91bmQgIT09IHVuZGVmaW5lZCAmJiBiYWNrZ3JvdW5kLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24uaXNDb2xvcihsb2dnZXIsIFwiYmFja2dyb3VuZFwiLCBiYWNrZ3JvdW5kKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBoYW50b20gPSBhd2FpdCBjcmVhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2UgPSBhd2FpdCBwaGFudG9tLmNyZWF0ZVBhZ2UoKTtcblxuICAgICAgICAgICAgbGV0IHN0eWxlID0gXCIqIHsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwIH1cIjtcblxuICAgICAgICAgICAgaWYgKGJhY2tncm91bmQgJiYgYmFja2dyb3VuZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc3R5bGUgKz0gYCBib2R5IHsgYmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kfX1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdyA9IHBhcnNlRmxvYXQod2lkdGgpO1xuICAgICAgICAgICAgbGV0IGggPSBwYXJzZUZsb2F0KGhlaWdodCk7XG4gICAgICAgICAgICBjb25zdCBtYXJnaW5YUGl4ZWxzID0gcGFyc2VGbG9hdChtYXJnaW5YKTtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbllQaXhlbHMgPSBwYXJzZUZsb2F0KG1hcmdpblkpO1xuXG4gICAgICAgICAgICB3IC09IG1hcmdpblhQaXhlbHMgKiAyO1xuICAgICAgICAgICAgaCAtPSBtYXJnaW5ZUGl4ZWxzICogMjtcblxuICAgICAgICAgICAgc3R5bGUgKz0gYCBpbWcgeyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6ICR7bWFyZ2luWFBpeGVsc31weDsgdG9wOiAke21hcmdpbllQaXhlbHN9cHh9YDtcblxuICAgICAgICAgICAgY29uc3Qgc3ZnRmlsZW5hbWUgPSBmaWxlU3lzdGVtLnBhdGhDb21iaW5lKHNvdXJjZUZvbGRlciwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBgPGh0bWw+PHN0eWxlPiR7c3R5bGV9PC9zdHlsZT48Ym9keT48aW1nIHdpZHRoPVwiJHt3fVwiIGhlaWdodD1cIiR7aH1cIiBzcmM9XFxcImZpbGU6Ly8vJHtzdmdGaWxlbmFtZX1cXFwiLz48L2JvZHk+PC9odG1sPmA7XG4gICAgICAgICAgICBhd2FpdCBwYWdlLnByb3BlcnR5KFwidmlld3BvcnRTaXplXCIsIHsgd2lkdGgsIGhlaWdodCB9KTtcbiAgICAgICAgICAgIGF3YWl0IHBhZ2UucHJvcGVydHkoXCJjb250ZW50XCIsIGNvbnRlbnQpO1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gYXdhaXQgcGFnZS5yZW5kZXJCYXNlNjQoXCJQTkdcIik7XG4gICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLmZpbGVXcml0ZUJpbmFyeShkZXN0Rm9sZGVyLCBkZXN0RmlsZSwgQnVmZmVyLmZyb20oYmFzZTY0LCBcImJhc2U2NFwiKSk7XG5cbiAgICAgICAgICAgIHJldCA9IDA7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvbnZlcnNpb24gZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgcmV0ID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaGFudG9tKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBoYW50b20uZXhpdCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIElnbm9yZSBhbnkgZXJyb3JzIGZyb20gdGhlIGV4aXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHRvTWFzayhsb2dnZXI6IElMb2dnZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtOiBJRmlsZVN5c3RlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlRmlsZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZvbGRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdEZpbGU6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGxldCByZXQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwic291cmNlRm9sZGVyXCIsIHNvdXJjZUZvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFQYXJhbWV0ZXJWYWxpZGF0aW9uLm5vdEVtcHR5KGxvZ2dlciwgXCJzb3VyY2VGaWxlXCIsIHNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghUGFyYW1ldGVyVmFsaWRhdGlvbi5ub3RFbXB0eShsb2dnZXIsIFwiZGVzdEZvbGRlclwiLCBkZXN0Rm9sZGVyKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIVBhcmFtZXRlclZhbGlkYXRpb24ubm90RW1wdHkobG9nZ2VyLCBcImRlc3RGaWxlXCIsIGRlc3RGaWxlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBzdmdEYXRhID0gYXdhaXQgZmlsZVN5c3RlbS5maWxlUmVhZEJpbmFyeShzb3VyY2VGb2xkZXIsIHNvdXJjZUZpbGUpO1xuICAgICAgICAgICAgbGV0IHN2Z1RleHQgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoc3ZnRGF0YSk7XG5cbiAgICAgICAgICAgIHN2Z1RleHQgPSBzdmdUZXh0LnJlcGxhY2UoL2ZpbGw9XFxcIi4qP1xcXCIvZ2ksIFwiZmlsbD1cXFwicmdiKDAsMCwwKVxcXCJcIik7XG5cbiAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0uZmlsZVdyaXRlQmluYXJ5KGRlc3RGb2xkZXIsIGRlc3RGaWxlLCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3ZnVGV4dCkpO1xuXG4gICAgICAgICAgICByZXQgPSAwO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDb252ZXJzaW9uIGZhaWxlZFwiLCBlKTtcbiAgICAgICAgICAgIHJldCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbn1cbiJdfQ==
