module gameui  {

    //this class alow user to arrange objects in a grid forrmat
    //the anchor point is the center of object
    export class Grid extends UIItem {

        //provided variables
        private flowHorizontal = false;
        private cols: number;
        private rows: number;
        private padding: number;

        //defined variabples
        private hSpacing: number;
        private wSpacing: number;

        //control variables;
        private currentCol: number = 0;
        private currentRow: number = 0;

        constructor(cols: number, rows: number, width: number, height: number, padding: number=0, flowHorizontal?: boolean) {
            super();

            //define the variables
            this.flowHorizontal = flowHorizontal;
            this.cols = cols;
            this.rows = rows;
            this.padding = padding;
            this.width = width;
            this.height = height;

            //define other parameters
            this.wSpacing = (width - padding * 2) / cols;
            this.hSpacing = (height - padding * 2) / rows;

        }

        //place objecrs into a grid format
        public addObject(object: PIXI.DisplayObject) {

            this.addChild(object);
            object.x = this.getXPos();
            object.y = this.getYPos();
            this.updatePosition();
        }

        private getXPos(): number {
            return this.padding + this.currentCol * this.wSpacing + this.wSpacing / 2;
        }
        private getYPos(): number {
            return this.padding + this.currentRow * this.hSpacing + this.hSpacing / 2;
        }

        //define next Item position
        private updatePosition() {

            if (!this.flowHorizontal) {
                this.currentCol++;
                if (this.currentCol >= this.cols) {
                    this.currentCol = 0;
                    this.currentRow++;
                }
            } else {
                this.currentRow++;
                if (this.currentRow >= this.rows) {
                    this.currentRow = 0;
                    this.currentCol++;
                }
            }
        }

    }
}