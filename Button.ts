module gameui {

    // Class
    export class Button extends UIItem {

        public static DefaultSoundId: string;
        public static setDefaultSoundId(soundId: string) {
            this.DefaultSoundId = soundId;
        }

        private soundId: string;
        
        public enableAnimation = true;
        private originalScaleX: number;
        private originalScaleY: number;
        private event: (event?: any) => any;

        private pressed = false;
        
        constructor(event?: (event?: any) => any, soundId?: string) {
            super();
            this.event = event;

            this.interactive = true;

            if (event) {
                this.on("click", this.event);
                this.on("tap", this.event);
            }
            
            this.on("mousedown", (event: any) => { this.onPress(event);})
            this.on("touchstart", (event: any) => { this.onPress(event);})

            this.on("mouseup", (event: any) => { this.onOut(event); })
            this.on("touchend", (event: any) => { this.onOut(event); })
            this.on("mouseupoutside", (event: any) => { this.onOut(event); });
            this.on("touchendoutside", (event: any) => { this.onOut(event); });
            
            this.soundId = soundId;
            
        }

        public returnStatus(): void {
            if (!this.pressed) {
                this.scale.x = this.originalScaleX;
                this.scale.y = this.originalScaleY;
            }
        }
        
        protected onOut(Event: any) {
            if (this.pressed) {
                this.pressed = false;
                if (!this.enableAnimation) return
                this.set({ scaleX: this.originalScaleX * 1.1, scaleY: this.originalScaleY * 1.1 });
                createjs.Tween.get(this).to({ scaleX: this.originalScaleX, scaleY: this.originalScaleY }, 200, createjs.Ease.backOut);
            }
        }

        protected onPress(Event: any) {
            if (this.pressed) return;
            this.pressed = true;

            
            if (!this.enableAnimation) return

            if (this.originalScaleX == null) {
                this.originalScaleX = this.scaleX;
                this.originalScaleY = this.scaleY;
            }
            createjs.Tween.get(this).to({ scaleX: this.originalScaleX * 1.1, scaleY: this.originalScaleY * 1.1 }, 500, createjs.Ease.elasticOut).call(() => {
                if (!this.pressed) {
                    createjs.Tween.get(this).to({ scaleX: this.originalScaleX, scaleY: this.originalScaleY }, 300, createjs.Ease.backOut);
                }
            });

            if (!this.soundId) this.soundId = Button.DefaultSoundId;

            if (this.soundId) AudiosManager.playSound(this.soundId); 
        }

        public setSound(soundId: string) {
            this.soundId = soundId;
        }

    }

    export class ImageButton extends Button {

        public background: PIXI.Sprite;

        constructor(image: string, event?: (event?: any) => any, soundId?: string) {
            super(event, soundId);

           //adds image into it
            if (image != null) {

                this.background = <PIXI.Sprite>AssetsManager.getBitmap(image);
                this.addChildAt(this.background, 0);

                //Sets the image into the pivot center.
                if (this.background.getBounds()) {
                    this.centralizeImage(this.background );
                }
                else
                    if (this.background["image"])
                        this.background["image"].onload = () => { this.centralizeImage(this.background ) }
            }


            this.createHitArea();
        }
        
        //Sets the image into the pivot center.
        protected centralizeImage(image: PIXI.Sprite) {
            if (!image.getBounds()) return;

            image.pivot.x = image.getBounds().width / 2;
            image.pivot.y = image.getBounds().height / 2;

            if (this.centered) return;
            this.width =  image.getBounds().width;
            this.height = image.getBounds().height;
            this.centered = true;
        }
    }


    export class TwoImageButton extends ImageButton {

        public background2: PIXI.Sprite;

        constructor(image: string, image2: string, event?: (event?: any) => any, soundId?: string) {
            super(image, event, soundId);

            this.enableAnimation = false;
            if (image2 != null) {
                this.background2 = <PIXI.Sprite>AssetsManager.getBitmap(image2);
                this.addChildAt(this.background2, 0);
                this.centralizeImage(this.background2);
                this.background2.visible = false;
            }
        }

        protected onOut(Event: any) {
            super.onOut(Event);
            this.background2.visible = false;
            this.background.visible = true;
        }

        protected onPress(Event: any) {
            super.onPress(Event);
            this.background2.visible = true;
            this.background.visible = false;
        }
    }

    
    export class TextButton extends ImageButton {

        public text: PIXI.Text;

        constructor(text: string = "", font?: string, color?: number, background?: string, event?: (event?: any) => any, soundId?: string) {
            super(background, event, soundId);

            //add text into it.
            text = text.toUpperCase();

            this.text = new PIXI.Text(text, { fontStyle: font, fill: color, align: "center", textBaseline: "middle" });
           
            //createHitArea
            if (background == null) {
                this.width = this.text.getBounds().width * 1.5;
                this.height = this.text.getBounds().height * 1.5;
            }

            this.addChild(this.text);
            this.createHitArea();

            this.createHitArea();
        }


    }

    export class TwoImageButtonBitmapText extends TwoImageButton {
        public bitmapText: PIXI.extras.BitmapText;

        constructor(text: string, bitmapFontId: string, color:number=0xffffff, background1?: string, background2?: string, event?: (event?: any) => any, soundId?: string) {
            super(background1, background2, event, soundId);

            //add text into it.
            text = text.toUpperCase();
            
            this.bitmapText = AssetsManager.getBitmapText(text, bitmapFontId,color);
            this.addChild(this.bitmapText);
            this.bitmapText.pivot.x = this.bitmapText.textWidth / 2;
            this.bitmapText.pivot.y = this.bitmapText.textHeight / 2;
            this.bitmapText.y = 10;
            this.createHitArea();
        }

        protected onOut(Event: any) {
            super.onOut(Event);
            this.bitmapText.y = 10;
        }

        protected onPress(Event: any) {
            super.onPress(Event);
            this.bitmapText.y = 0;
        }
    }

    export class BitmapTextButton extends ImageButton {

        public bitmapText: PIXI.extras.BitmapText;

        constructor(text: string, bitmapFontId: string, background?: string, event?: (event?: any) => any, soundId?: string) {
            super(background, event, soundId);

            //add text into it.
            text = text.toUpperCase();

            this.bitmapText = AssetsManager.getBitmapText(text, bitmapFontId);
            this.addChild(this.bitmapText);
            this.bitmapText.pivot.x = this.bitmapText.textWidth / 2;
            this.bitmapText.pivot.y = this.bitmapText.textHeight / 2 + 20;

            this.createHitArea();
        }
    }


    export class IconTextButton extends TextButton {

        private align: string;
        public icon: PIXI.DisplayObject;

        constructor(icon: string = "", text = "", font: string = null, color?: number, background?: string, event?: (event?: any) => any, soundId?: string, align: string = "center") {
            super(text, font, color, background, event, soundId);

            this.align = align;

            //loads icon Image
            this.icon = AssetsManager.getBitmap(icon);
            this.addChild(this.icon);

            this.text.style.align = "left";

            if (this.icon.getBounds())
                this.icon.pivot.y = this.icon.getBounds().height / 2;
            else
                if (this.icon["image"])
                    this.icon["image"].onload = () => {
                        this.icon.pivot.y = this.icon.getBounds().height / 2;
                    }

            this.updateLabel(text);

            this.createHitArea();
        }

        public updateLabel(value: string) {

            this.text.text = value;
            if (!this.icon.getBounds()) return;

            switch (this.align) {
                case "center":
                    this.icon.x = -(this.icon.getBounds().width + 10 + this.text.getBounds().width) / 2;
                    this.text.x = this.icon.x + this.icon.getBounds().width + 10;
                    break;
                case "left":
                    this.icon.x = -this.width / 2 + 80;
                    this.text.x = -this.width / 2 + 80 + this.icon.getBounds().width + 100;
                    break;
            }
        }

        centralizeIcon() {
        }
    }


    export class IconBitmapTextButton extends BitmapTextButton {

        private align: string;
        public icon: PIXI.DisplayObject;

        constructor(icon: string = "", text = "", font: string = null, background?: string, event?: (event?: any) => any, soundId?: string, align: string = "center") {
            super(text, font, background, event, soundId);

            this.align = align;

            //loads icon Image
            this.icon = AssetsManager.getBitmap(icon);
            this.addChild(this.icon);

            if (this.icon.getBounds())
                this.icon.pivot.y = this.icon.getBounds().height / 2;
            else
                if (this.icon["image"])
                    this.icon["image"].onload = () => {
                        this.icon.pivot.y = this.icon.getBounds().height / 2;
                    }

            this.updateLabel(text);
            this.createHitArea();
        }

        public updateLabel(value: string) {

            this.bitmapText.text = value;
            if (!this.icon.getBounds()) return;

            switch (this.align) {
                case "center":
                    this.icon.x = -(this.icon.getBounds().width + 10 + this.bitmapText.getBounds().width) / 2;
                    this.bitmapText.x = this.icon.x + this.icon.getBounds().width + 10;
                    break;
                case "left":
                    this.icon.x = -this.width / 2 + 80
                    this.bitmapText.pivot.x = 0;
                    this.bitmapText.x = -this.width / 2 + 80 + this.icon.getBounds().width + 100;
                    break;
            }
        }

        centralizeIcon() {
        }
    }



    export class IconButton extends IconTextButton {
        constructor(icon: string = "", background?: string, event?: (event?: any) => any, soundId?: string) {
            super(icon, "", "", 0xFFFFFF, background, event, soundId);
        }
    }
}