var images: Array<HTMLImageElement>;

module gameui {

    // Class
    export class AssetsManager {

        private static loader: PIXI.loaders.Loader;
        private static spriteSheets: Array<any>;
        private static assetsManifest: Array<any>;
        private static defaultMouseEnabled: boolean = false;

        public static onProgress: (progress: number) => void;
        public static onComplete: () => void;

        //load assets
        public static loadAssets(manifest: Array<any>, path: string = "", spriteSheets?: Array<any>) {

            // initialize objects
            this.spriteSheets = spriteSheets ? spriteSheets : new Array();
            this.assetsManifest = manifest;

            if (!images) images = images ? images : new Array();

            if (!this.loader) {
                //creates a preload queue
                this.loader = new PIXI.loaders.Loader(path);

                // Adds callbacks
                //this.loader.addEventListener("filestart", (evt: any) => { console.log("loading " + evt.item.src) })
                this.loader.on("error ", (evt: any) => { console.log("error " + evt.item.src) })
                this.loader.on("fileerror ", (evt: any) => { console.log("ferror " + evt.item.src) })
                this.loader.on("progress", (evt: any) => { if (this.onProgress) this.onProgress(evt.progress) })
                this.loader.on("fileload", (evt: any): boolean => {
                    if (evt.item.type == "image")
                        images[evt.item.id] = <HTMLImageElement>evt.result;
                    return true;
                });

                this.loader.on("complete", (loader, resources) => {
                    for (var r in resources) images[r] = resources[r].texture;

                    if (this.onComplete) this.onComplete();
                })
            }

            //loads entire manifest 
            for (var m in manifest) {
                this.loader.add(manifest[m].id, manifest[m].src);
            }
            

        }

        public static reset() {
            this.loader.reset();
        }

        // load a font spritesheet
        public static loadFontSpriteSheet(id: string, fontFile: string, options: any = null) {
            this.loader.add(id, fontFile, options);
        }

        public static loadSpriteSheet(id: string, fontFile: string) {
            this.loader.add(id, fontFile);
        };

        public static load(callback) {
            if (callback)
                this.loader.load(callback);
        };

        // cleans all sprites in the bitmap array;
        public static cleanAssets() {
            if (images)
                for (var i in images) {
                    var img = <any>images[i]
                    if (img.dispose) img.dispose();
                    delete images[i]
                }
        }

        // return loaded image array
        public static getImagesArray(): Array<HTMLImageElement> {
            return images;
        }

        //gets a image from assets
        public static getBitmap(name: string): PIXI.Sprite {

            //if image is preloaded
            var texture = this.getLoadedImage(name);
            if (!texture)
                texture = PIXI.utils.TextureCache[name];
            if (texture) {
                var imgobj = new PIXI.Sprite(texture);
                imgobj.interactive = AssetsManager.defaultMouseEnabled;
                return imgobj;
            }

            //or else try grab by filename
            var imgobj = PIXI.Sprite.fromImage(name);
            imgobj.interactive = AssetsManager.defaultMouseEnabled;
            imgobj.texture["resolution"] = assetscale;
            return imgobj;

        }

        //get a bitmap Text
        public static getBitmapText(text: string, bitmapFontId: string, color: number = 0xffffff, size: number = 1): PIXI.extras.BitmapText {
            var bitmapText = new PIXI.extras.BitmapText(text, { font: bitmapFontId, align: 'left' });
            bitmapText.tint = color;
            bitmapText.maxLineHeight = 100;
            bitmapText.interactiveChildren = AssetsManager.defaultMouseEnabled;
            bitmapText.scaleX = bitmapText.scaleY = size;
            return bitmapText;
        }

        //Get a preloaded Image from assets
        public static getLoadedImage(name: string): PIXI.Texture {
            if (this.loader)
                if (!this.loader.resources[name]) return null;
            return this.loader.resources[name].texture;
        }

        //return a sprite according to the image
        public static getMovieClip(name: string): PIXI.extras.MovieClip {
            var textures = [];
            var n2 = function (n) { return n > 9 ? "" + n : "0" + n; }

            for (var i = 0; i < 999; i++) {

                var id = name + n2(i);
                if (!PIXI.utils.TextureCache[id]) break;
                var texture = PIXI.Texture.fromFrame(id);
                textures.push(texture);
            }

            var mc = new PIXI.extras.MovieClip(textures);

            //mc.play();
            return mc;
        }

        // #endregion 
    }
}