/**
 * SVG class for manipulating SVG images.
 */
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
export declare class SVG {
    private _fileSystem;
    constructor(fileSystem: IFileSystem);
    convertToPng(sourceFolder: string, sourceFilename: string, destFolder: string, destFilename: string, destWidth: number, destHeight: string): Promise<void>;
}
