declare function getQueryVariable(variable: string);
declare function setMobileScale(a: number);
declare var assetscale: number;
declare function requestAnimationFrame(callback: any): void;
declare var notCocoon;
notCocoon = false;
//TODO remove universal variable defaultWidth and DefaultHeigth

module gameui {
    var PIXIrenderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
    var PIXIstage: PIXI.Container;
    var updateFn;
    var minfps = 100;
    var last = 0;
    var doing = false;

    export class GameScreen {
        private defaultWidth: number;
        private defaultHeight: number;

        private canvasWidth: number;
        private canvasHeight: number;

        private currentScale: number;

        //Screen arrangement
        public headerPosition: number;
        public footerPosition: number;
        public viewerOffset: number;

        public currentWidth: number;
        public currentHeight: number;

        //Screen state
        public currentScreen: ScreenState;

        //screen content
        private screenContainer: PIXI.Container;

        // atualização da tela
        private time: number;


        //-----------------------------------------------------------------------

        constructor(divId: string, gameWidth: number, gameHeight?: number, fps: number = 60) {

            this.defaultWidth = gameWidth;
            this.defaultHeight = gameHeight;

             // create a renderer instance.
            PIXIstage = new PIXI.Container();
            PIXIrenderer = PIXI.autoDetectRenderer(gameWidth, gameHeight);//, { backgroundColor: 0 });
            //PIXIrenderer = PIXI.autoDetectRenderer(gameWidth, gameHeight);//, { backgroundColor: 0 });
            //var interactionManager = new PIXI.interaction.InteractionManager(PIXIrenderer);

            // add the renderer view element to the DOM
            document.getElementById(divId).appendChild(PIXIrenderer.view);

            this.screenContainer = new PIXI.Container();
            PIXIstage.addChild(this.screenContainer);

            //var windowWidth = window.innerWidth;
            this.resizeGameScreen(window.innerWidth, window.innerHeight);
            window.onresize = () => { this.resizeGameScreen(window.innerWidth, window.innerHeight); };

            createjs.Tween["_inited"] = true;
            
            //if is not cocoon, then .. its windows
            if (!window["Cocoon"]) notCocoon = true;
            updateFn = this.update
            updateFn();
        }


        private update(timestamp: number): void {
            if (!timestamp) timestamp = Date.now();
            if (!this.time) this.time = timestamp;

            var delta = timestamp - this.time;
            this.time = timestamp;
            var fps = 60
            var delay = Math.min(1000 / fps, (1000 / fps - delta))
            
            createjs.Tween.tick(delta, false);
            PIXIrenderer.render(PIXIstage);

            //opera de modo diferente se não for cocoon
            if (notCocoon)
                setTimeout(updateFn, delay);
            else
                requestAnimationFrame(updateFn);

        }

        // switch current screen, optionaly with a pre defined transition
        public switchScreen(newScreen: ScreenState, parameters?: any, transition?: Transition) {

            //save oldscreen
            var oldScreen = this.currentScreen;
            //applies a default trainsition
            if (!transition) transition = new Transition();

            var x = 0;
            var y = 0;
            var scale = 1;
            var alpha = 1;

            //if transition
            if (transition && oldScreen) {

                switch (transition.type) {
                    case "fade":
                        alpha = 0;
                        break;

                    case "top":
                        y = this.currentHeight;
                        break;

                    case "bottom":
                        y = -this.currentHeight;
                        break;

                    case "left":
                        x = -this.currentWidth;
                        break;

                    case "right":
                        x = this.currentWidth;
                        break;

                    case "none":
                        transition.time = 0;
                        break;

                    case "zoomOut":
                        scale = 1 / 5;
                        x = (defaultWidth) * 2;
                        y = (defaultHeight) * 2;
                        alpha = 0;
                        break;

                    case "zoomIn":
                        scale = 5;
                        x = -(defaultWidth / 2);
                        y = -(defaultHeight / 2);
                        alpha = 0;
                        break;
                }
                
                newScreen.view.interactiveChildren = false;
                oldScreen.view.interactiveChildren = false;
                oldScreen.transitioning = true;
                newScreen.transitioning = true;
                //and transition = fade
                if (transition.type && transition.type != "none") {

                    //fade between transitions
                    newScreen.view.alpha = alpha;
                    newScreen.view.x = -x;
                    newScreen.view.y = -y;
                    newScreen.view.scaleX = 1 / scale;
                    newScreen.view.scaleY = 1 / scale;

                    oldScreen.view.alpha = 1;
                    oldScreen.view.x = 0;
                    oldScreen.view.y = 0;

                    //fade old screen out
                    createjs.Tween.get(oldScreen.view).to({ scaleX: scale, scaleY: scale, alpha: 1, x: x * scale, y: y * scale }, transition.time, createjs.Ease.quadInOut);
                    createjs.Tween.get(newScreen.view).to({ scaleX: 1, scaleY: 1, alpha: 1, x: 0, y: 0 }, transition.time, createjs.Ease.quadInOut).call(() => {

                        oldScreen.view.set({ scaleX: 1, scaleY: 1, alpha: 0, x: 0, y: 0 })
                        newScreen.view.set({ scaleX: 1, scaleY: 1, alpha: 1, x: 0, y: 0 })
                        
                        newScreen.view.interactiveChildren = true;
                        oldScreen.view.interactiveChildren = true;
                        oldScreen.transitioning = false;
                        newScreen.transitioning = false;

                        this.removeOldScreen(oldScreen)
                        oldScreen = null;

                    });


                }
                else {
                    this.removeOldScreen(oldScreen);
                    oldScreen = null;
                }
            }

            //if there is no transistion siply remove screen
            else {
                this.removeOldScreen(oldScreen);
                oldScreen = null;
            }

            //adds the new screen on viewer
            newScreen.activate(parameters);
            this.screenContainer.addChild(newScreen.view);

            this.currentScreen = newScreen;

            //updates current screen
            this.currentScreen.redim(this.headerPosition, this.footerPosition, this.currentWidth, this.currentHeight);
        }

        // resize GameScreen to a diferent scale
        public resizeGameScreen(deviceWidth: number, deviceHeight: number) {

            //keep aspect ratio 
            if (this.defaultHeight) {
                var defaultAspect = this.defaultWidth / this.defaultHeight;
                var aspectReal = deviceWidth / deviceHeight;

                if (aspectReal > defaultAspect) {
                    var s = deviceHeight / this.defaultHeight;
                    deviceWidth = this.defaultWidth * s;
                }
            }

            PIXIrenderer.resize(deviceWidth, deviceHeight);

            this.updateViewerScale(deviceWidth, deviceHeight, this.defaultWidth, this.defaultHeight);
        }

        // updates screen viewer scale
        private updateViewerScale(realWidth: number, realHeight: number, defaultWidth: number, defaultHeight: number) {

            var scale = realWidth / defaultWidth;
            this.currentHeight = realHeight / scale;
            this.currentWidth = realWidth / scale;
            this.defaultWidth = defaultWidth;

            // set header and footer positions
            this.headerPosition = -(this.currentHeight - defaultHeight) / 2;
            this.footerPosition = defaultHeight + (this.currentHeight - defaultHeight) / 2;

            // set the viewer offset to centralize in window
            this.screenContainer.scaleX = this.screenContainer.scaleY = scale;
            this.screenContainer.y = this.viewerOffset = (this.currentHeight - defaultHeight) / 2 * scale;

            // updates current screen
            if (this.currentScreen) this.currentScreen.redim(this.headerPosition, this.footerPosition, this.currentWidth, this.currentHeight);

            // update corrent scale
            this.currentScale = scale;
        }

        public getCurrentScale() {
            return this.currentScale;
        }

        // deletes old screen
        private removeOldScreen(oldScreen: ScreenState) {
            if (oldScreen != null) {
                oldScreen.desactivate();
                this.screenContainer.removeChild(oldScreen.view);
                oldScreen = null;
            }
        }

        // send hw back button event
        public sendBackButtonEvent(): boolean {
            if (this.currentScreen && this.currentScreen.onback && !this.currentScreen.transitioning) {
                this.currentScreen.onback();
                return false;
            }
            else return true
        }
    }
}

