module gameui {

    // Class
    export class UIItem extends PIXI.Container {

        //TODO, replace width height by getBounds...

        //default Variables
        public width: number;
        public height: number;
        public centered: boolean = false;

        public hitPadding: number;

        public animating = false;

        private antX;
        private antY;

        private oldScaleX;
        private oldScaleY;

        public centralize() {
            this.pivot.x = this.width / 2;
            this.pivot.y = this.height / 2;
            this.centered = true;
        }

        public fadeOut(scaleX: number= 0.5, scaleY: number= 0.5) {
            this.resetFade()

            if (!this.scale.x) this.scale.x = 1;
            if (!this.scale.y) this.scale.y = 1;

            this.oldScaleX = this.scale.x;
            this.oldScaleY = this.scale.y;

            createjs.Tween.get(this).to({
                scaleX: scaleX, 
                scaleY: scaleY, 
                alpha: 0,
                x: this.antX,
                y: this.antY,
            }, 200, createjs.Ease.quadIn).call(() => {
                    this.visible = false;
                    this.x = this.antX;
                    this.y = this.antY;
                    this.scale.x = this.oldScaleX;
                    this.scale.y = this.oldScaleY;
                    this.alpha = 1;
                    this.animating = false;
                    this.interactive = true;;
                });
        }

        private resetFade() {
            this.animating = true;
            this.antX = this.x;
            this.antY = this.y;
            this.scale.x = this.oldScaleX;
            this.scale.y = this.oldScaleY;
            this.interactive = false;
            createjs.Tween.removeTweens(this);
        }

        public fadeIn(scaleX: number = 0.5, scaleY: number = 0.5) {

            this.resetFade()
            if (this.visible = true) this.antX = null;

            if (!this.scale.x) this.scale.x = 1;
            if (!this.scale.y) this.scale.y = 1;

            this.oldScaleX = this.scale.x;
            this.oldScaleY = this.scale.y;
                        
            this.visible = true;
            this.animating = true;

            if (this.antX == null) {
                this.antX = this.x;
                this.antY = this.y;
            }

            this.scale.x = scaleX,
            this.scale.y = scaleY,
            this.alpha = 0,
            this.x = this.x;
            this.y = this.y;

            this.interactive = false;
            createjs.Tween.removeTweens(this);
            createjs.Tween.get(this).to({
                scaleX: this.oldScaleX, 
                scaleY: this.oldScaleY,   
                alpha: 1,
                x: this.antX, 
                y: this.antY,
            }, 400, createjs.Ease.quadOut)

                .call(() => {
                    this.interactive = true;
                    this.animating = false;
                });
        }


        //calcula
        createHitArea(): void {
            
          
            var b = this.getLocalBounds();
            //if (b)
            //    if (this.hitPadding)
            //        hit.beginFill("#000").drawRect(b.x - this.hitPadding, b.y - this.hitPadding, b.width + this.hitPadding, b.height + this.hitPadding);
            //    else
            //         hit.beginFill("#000").drawRect(b.x, b.y, b.width, b.height);
            //TODO. se for texto colocar uma sobra. !

            this.hitArea = new PIXI.Rectangle(b.x, b.y, b.width, b.height);
         
        }
    }
}