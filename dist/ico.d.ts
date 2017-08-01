import { IDisplay } from "unitejs-framework/dist/interfaces/IDisplay";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
export declare class ICO {
    fromPngs(display: IDisplay, fileSystem: IFileSystem, sourceFolder: string, sourceFiles: string[], destFolder: string, destFile: string): Promise<number>;
    private imagesToIco(images);
    private getHeader(numOfImages);
    private getDir(img, offset);
    private getBmpInfoHeader(img, compressionMode);
    private getDib(img);
}
