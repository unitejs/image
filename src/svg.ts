/**
 * SVG class for manipulating SVG images.
 */
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";

export class SVG {
    private _fileSystem: IFileSystem;

    constructor(fileSystem: IFileSystem) {
        this._fileSystem = fileSystem;
    }

    public async convertToPng(sourceFolder: string, sourceFilename: string, destFolder: string, destFilename: string, destWidth: number, destHeight: string): Promise<void> {
        return Promise.resolve();
    }
}
