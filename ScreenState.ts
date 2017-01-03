

module gameui {
    export class ScreenState {

        public content: PIXI.Container;
        public overlay: PIXI.Container;
        public header :PIXI.Container;
        public footer: PIXI.Container;
        public background: PIXI.Container;

        public view: PIXI.Container;

        public screenHeight: number;
        public screenWidth: number;

        public bgmusic: createjs.SoundInstance;

        public transitioning: boolean

		public onback: ()=>void;

        constructor() {
            this.view = new PIXI.Container();
            this.content = new PIXI.Container();
            this.overlay = new PIXI.Container();
            this.header = new PIXI.Container();
            this.footer = new PIXI.Container();
            this.background = new PIXI.Container();

            this.view.addChild(this.background);
            this.view.addChild(this.content);
            this.view.addChild(this.footer );
            this.view.addChild(this.header);
            this.view.addChild(this.overlay);
        }

        public activate(parameters?:any) {
            this.content.visible = true;
        }

        public desactivate(parameters?: any) {
            this.content.visible = false;
        }

        public redim(headerY: number, footerY: number, width: number, heigth: number) {

            this.screenHeight = heigth;
            this.screenWidth = width;

            this.footer.y = footerY;
            this.header.y = headerY;

            var dh = footerY + headerY;
            var ch = footerY - headerY;
            var scale = ch / dh;

            if (scale < 1) {
                scale = 1;
                this.background.y = 0;
                this.background.x = 0;
            } else {
                this.background.y = headerY;

				//if (false) {
				//	this.background.x = -(width * scale - width) / 2;
				//	this.background.scale.x = this.background.scale.y = scale;
				//} else {
					this.background.x = 0;
					this.background.scaleY = scale;
				//}
            }



            ///Check
         //  var mask = new PIXI.Graphics().beginFill(0x000000).drawRect(0, -(heigth - defaultHeight) / 2, width, heigth)
         //  this.background.mask = mask;
         //  this.footer.mask = mask;
         //  this.header.mask = mask;
         //  this.content.mask = mask;
        }
    }
}