import { Component, ViewChild, HostListener, HostBinding, } from '@angular/core';
import { trigger, transition, query, style, stagger, animate, keyframes, } from '@angular/animations';
import { ColorFormats } from '../../enums/formats';
import { defaultColors } from '../../helpers/default-colors';
import { formats } from '../../helpers/formats';
import { Hsva } from '../../clases/formats';
import { NgxColorsColor } from '../../clases/color';
import * as i0 from "@angular/core";
import * as i1 from "../../services/converter.service";
import * as i2 from "@angular/common";
import * as i3 from "../color-picker/color-picker.component";
export class PanelComponent {
    click(event) {
        if (this.isOutside(event)) {
            this.emitClose('cancel');
        }
    }
    onScroll() {
        this.onScreenMovement();
    }
    onResize() {
        this.onScreenMovement();
    }
    constructor(service, cdr) {
        this.service = service;
        this.cdr = cdr;
        this.color = '#000000';
        this.previewColor = '#000000';
        this.hsva = new Hsva(0, 1, 1, 1);
        this.colorsAnimationEffect = 'slide-in';
        this.palette = defaultColors;
        this.variants = [];
        this.userFormats = [];
        this.colorFormats = formats;
        this.format = ColorFormats.HEX;
        this.formatMap = {
            'hex': ColorFormats.HEX,
            'rgba': ColorFormats.RGBA,
            'hsla': ColorFormats.HSLA,
            'cmyk': ColorFormats.CMYK
        };
        this.canChangeFormat = true;
        this.menu = 1;
        this.hideColorPicker = false;
        this.hideTextInput = false;
        this.colorPickerControls = 'default';
        this.dir = 'ltr';
        this.placeholder = '#FFFFFF';
    }
    ngOnInit() {
        this.setPosition();
        this.hsva = this.service.stringToHsva(this.color);
        this.indexSeleccionado = this.findIndexSelectedColor(this.palette);
    }
    ngAfterViewInit() {
        this.setPositionY();
    }
    onScreenMovement() {
        this.setPosition();
        this.setPositionY();
        if (!this.panelRef.nativeElement.style.transition) {
            this.panelRef.nativeElement.style.transition = 'transform 0.5s ease-out';
        }
    }
    findIndexSelectedColor(colors) {
        let resultIndex = undefined;
        if (this.color) {
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                if (typeof color == 'string') {
                    if (this.service.stringToFormat(this.color, ColorFormats.HEX) ==
                        this.service.stringToFormat(color, ColorFormats.HEX)) {
                        resultIndex = i;
                    }
                }
                else if (color === undefined) {
                    this.color = undefined;
                }
                else {
                    if (this.findIndexSelectedColor(color.variants) != undefined) {
                        resultIndex = i;
                    }
                }
            }
        }
        return resultIndex;
    }
    iniciate(triggerInstance, triggerElementRef, color, palette, animation, format, hideTextInput, hideColorPicker, acceptLabel, cancelLabel, colorPickerControls, position, userFormats = [], dir = 'ltr') {
        this.colorPickerControls = colorPickerControls;
        this.triggerInstance = triggerInstance;
        this.TriggerBBox = triggerElementRef;
        this.color = color;
        this.hideColorPicker = hideColorPicker;
        this.hideTextInput = hideTextInput;
        this.acceptLabel = acceptLabel;
        this.cancelLabel = cancelLabel;
        if (userFormats.length) {
            const allFormatsValid = userFormats.every(frt => formats.includes(frt));
            if (allFormatsValid) {
                this.colorFormats = userFormats;
            }
        }
        if (format) {
            if (this.colorFormats.includes(format)) {
                this.format = this.colorFormats.indexOf(format.toLowerCase());
                this.canChangeFormat = false;
                if (this.service.getFormatByString(this.color) != format.toLowerCase()) {
                    this.setColor(this.service.stringToHsva(this.color));
                }
            }
            else {
                console.error('Format provided is invalid, using HEX');
                this.format = ColorFormats.HEX;
            }
        }
        else {
            this.format = this.colorFormats.indexOf(this.service.getFormatByString(this.color));
            if (this.format < 0) {
                this.format = 0;
            }
        }
        this.previewColor = this.color;
        this.palette = palette ?? defaultColors;
        this.colorsAnimationEffect = animation;
        this.dir = dir;
        if (position == 'top') {
            let TriggerBBox = this.TriggerBBox.nativeElement.getBoundingClientRect();
            this.positionString =
                'transform: translateY(calc( -100% - ' + TriggerBBox.height + 'px ))';
        }
    }
    setPosition() {
        if (this.TriggerBBox) {
            const panelWidth = 250;
            const isDocumentRTL = document.dir === 'rtl';
            const viewportOffset = this.TriggerBBox.nativeElement.getBoundingClientRect();
            this.top = viewportOffset.top + viewportOffset.height;
            if (isDocumentRTL) {
                if (viewportOffset.left + panelWidth > window.innerWidth) {
                    this.left = viewportOffset.left < panelWidth
                        ? window.innerWidth / 2 + panelWidth / 2
                        : viewportOffset.left + panelWidth;
                }
                else {
                    this.left = viewportOffset.left + panelWidth;
                }
            }
            else {
                if (viewportOffset.left + panelWidth > window.innerWidth) {
                    this.left = viewportOffset.right < panelWidth
                        ? window.innerWidth / 2 - panelWidth / 2
                        : viewportOffset.right - panelWidth;
                }
                else {
                    this.left = viewportOffset.left;
                }
            }
        }
    }
    setPositionY() {
        const triggerBBox = this.TriggerBBox.nativeElement.getBoundingClientRect();
        const panelBBox = this.panelRef.nativeElement.getBoundingClientRect();
        const panelHeight = panelBBox.height;
        // Check for space below the trigger
        if (triggerBBox.bottom + panelHeight > window.innerHeight) {
            // there is no space, move panel over the trigger
            this.positionString =
                triggerBBox.top < panelBBox.height
                    ? 'transform: translateY(-' + triggerBBox.bottom + 'px );'
                    : 'transform: translateY(calc( -100% - ' +
                        triggerBBox.height +
                        'px ));';
        }
        else {
            this.positionString = '';
        }
        this.cdr.detectChanges();
    }
    hasVariant(color) {
        if (!this.previewColor) {
            return false;
        }
        return (typeof color != 'string' &&
            color.variants.some((v) => v.toUpperCase() == this.previewColor.toUpperCase()));
    }
    isSelected(color) {
        if (!this.previewColor) {
            return false;
        }
        return (typeof color == 'string' &&
            color.toUpperCase() == this.previewColor.toUpperCase());
    }
    getBackgroundColor(color) {
        if (typeof color == 'string') {
            return { background: color };
        }
        else {
            return { background: color?.preview };
        }
    }
    onAlphaChange(event) {
        this.palette = this.ChangeAlphaOnPalette(event, this.palette);
    }
    ChangeAlphaOnPalette(alpha, colors) {
        var result = [];
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            if (typeof color == 'string') {
                let newColor = this.service.stringToHsva(color);
                newColor.onAlphaChange(alpha);
                result.push(this.service.toFormat(newColor, this.format));
            }
            else {
                let newColor = new NgxColorsColor();
                let newColorPreview = this.service.stringToHsva(color.preview);
                newColorPreview.onAlphaChange(alpha);
                newColor.preview = this.service.toFormat(newColorPreview, this.format);
                newColor.variants = this.ChangeAlphaOnPalette(alpha, color.variants);
                result.push(newColor);
            }
        }
        return result;
    }
    /**
     * Change color from default colors
     * @param string color
     */
    changeColor(color) {
        this.setColor(this.service.stringToHsva(color));
        // this.triggerInstance.onChange();
        this.emitClose('accept');
    }
    onChangeColorPicker(event) {
        this.temporalColor = event;
        this.color = this.service.toFormat(event, this.format);
        // this.setColor(event);
        this.triggerInstance.sliderChange(this.service.toFormat(event, this.format));
    }
    changeColorManual(color) {
        this.previewColor = color;
        this.color = color;
        this.hsva = this.service.stringToHsva(color);
        this.setPreviewColor(this.hsva);
        this.temporalColor = this.hsva;
        this.triggerInstance.setColor(this.color, this.previewColor);
        // this.triggerInstance.onChange();
    }
    setColor(value, colorIndex = -1) {
        this.hsva = value;
        let formatName = this.colorFormats[this.format];
        let index = colorIndex;
        if (index < 0) {
            index = this.formatMap[formatName];
        }
        this.color = this.service.toFormat(value, index);
        this.setPreviewColor(value);
        this.triggerInstance.setColor(this.color, this.previewColor);
    }
    setPreviewColor(value) {
        this.previewColor = value
            ? this.service.hsvaToRgba(value).toString()
            : undefined;
    }
    onChange() {
        // this.triggerInstance.onChange();
    }
    onColorClick(color) {
        if (typeof color == 'string' || color === undefined) {
            this.changeColor(color);
        }
        else {
            this.variants = color.variants;
            this.menu = 2;
        }
    }
    addColor() {
        this.menu = 3;
        this.backupColor = this.color;
        // this.color = "#FF0000";
        this.temporalColor = this.service.stringToHsva(this.color);
    }
    nextFormat() {
        if (this.canChangeFormat) {
            this.format = (this.format + 1) % this.colorFormats.length;
            let formatName = this.colorFormats[this.format];
            let index = this.formatMap[formatName];
            this.setColor(this.hsva, index);
            this.placeholder = this.service.toFormat(new Hsva(0, 0, 1, 1), index);
        }
    }
    emitClose(status) {
        if (this.menu == 3) {
            if (status == 'cancel') {
            }
            else if (status == 'accept') {
                this.setColor(this.temporalColor);
            }
        }
        this.triggerInstance.closePanel();
    }
    onClickBack() {
        if (this.menu == 3) {
            this.color = this.backupColor;
            this.hsva = this.service.stringToHsva(this.color);
        }
        this.indexSeleccionado = this.findIndexSelectedColor(this.palette);
        this.menu = 1;
    }
    isOutside(event) {
        return event.target.classList.contains('ngx-colors-overlay');
    }
}
PanelComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: PanelComponent, deps: [{ token: i1.ConverterService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
PanelComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.10", type: PanelComponent, selector: "ngx-colors-panel", host: { listeners: { "document:mousedown": "click($event)", "document:scroll": "onScroll()", "window:resize": "onResize()" }, properties: { "style.top.px": "this.top", "style.left.px": "this.left" } }, viewQueries: [{ propertyName: "panelRef", first: true, predicate: ["dialog"], descendants: true }], ngImport: i0, template: "<div class=\"opened\" [style]=\"positionString\" [attr.dir]=\"dir\" #dialog>\n  <ng-container *ngIf=\"menu == 1\">\n    <div class=\"colors\" [@colorsAnimation]=\"colorsAnimationEffect\">\n      <ng-container *ngFor=\"let color of palette; let i = index\">\n        <div class=\"circle wrapper color\">\n          <div\n            (click)=\"onColorClick(color)\"\n            class=\"circle color circle-border\"\n            [class.colornull]=\"!color\"\n            [ngStyle]=\"getBackgroundColor(color)\"\n          >\n            <div *ngIf=\"i == this.indexSeleccionado\" class=\"selected\"></div>\n          </div>\n        </div>\n      </ng-container>\n      <div\n        style=\"background: rgb(245 245 245); position: relative\"\n        (click)=\"addColor()\"\n        *ngIf=\"!hideColorPicker && this.colorPickerControls != 'only-alpha'\"\n        class=\"circle button\"\n      >\n        <div\n          *ngIf=\"this.indexSeleccionado === undefined\"\n          style=\"\n            position: absolute;\n            height: 7px;\n            width: 7px;\n            border: 1px solid rgba(0, 0, 0, 0.03);\n            border-radius: 100%;\n            top: 0;\n            right: 0;\n          \"\n          [ngStyle]=\"getBackgroundColor(color)\"\n        ></div>\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          height=\"24px\"\n          viewBox=\"0 0 24 24\"\n          width=\"24px\"\n          fill=\"#222222\"\n        >\n          <path d=\"M24 24H0V0h24v24z\" fill=\"none\" opacity=\".87\" />\n          <path d=\"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z\" />\n        </svg>\n        <!-- <div class=\"add\">\n          <icons icon=\"add\"></icons>\n        </div> -->\n      </div>\n      <color-picker\n        *ngIf=\"!hideColorPicker && this.colorPickerControls == 'only-alpha'\"\n        [controls]=\"colorPickerControls\"\n        [color]=\"hsva\"\n        [dir]=\"dir\"\n        (colorChange)=\"onChangeColorPicker($event)\"\n        (onAlphaChange)=\"onAlphaChange($event)\"\n      ></color-picker>\n    </div>\n  </ng-container>\n  <ng-container *ngIf=\"menu == 2\">\n    <div class=\"colors\" [@colorsAnimation]=\"colorsAnimationEffect\">\n      <div class=\"circle wrapper\">\n        <div (click)=\"onClickBack()\" class=\"add\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            width=\"24\"\n            height=\"24\"\n            viewBox=\"0 0 24 24\"\n            [class.rtl-icon]=\"dir === 'rtl'\"\n          >\n            <path d=\"M0 0h24v24H0z\" fill=\"none\" />\n            <path\n              d=\"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z\"\n            />\n          </svg>\n        </div>\n      </div>\n\n      <ng-container *ngFor=\"let variant of variants\">\n        <div class=\"circle wrapper color\">\n          <div\n            [class.colornull]=\"!variant\"\n            (click)=\"changeColor(variant)\"\n            class=\"circle circle-border\"\n            [ngStyle]=\"{ background: variant }\"\n          >\n            <div *ngIf=\"isSelected(variant)\" class=\"selected\"></div>\n          </div>\n        </div>\n      </ng-container>\n    </div>\n  </ng-container>\n  <ng-container *ngIf=\"menu == 3\">\n    <div class=\"nav-wrapper\" [class.rtl-nav]=\"dir === 'rtl'\">\n      <div\n        (click)=\"onClickBack()\"\n        class=\"round-button button\"\n        [class.rtl-button]=\"dir === 'rtl'\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          width=\"24\"\n          height=\"24\"\n          viewBox=\"0 0 24 24\"\n          [class.rtl-icon]=\"dir === 'rtl'\"\n        >\n          <path d=\"M0 0h24v24H0z\" fill=\"none\" />\n          <path\n            d=\"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z\"\n          />\n        </svg>\n      </div>\n      <button (click)=\"emitClose('cancel')\" [class.rtl-button]=\"dir === 'rtl'\">\n        {{ cancelLabel }}\n      </button>\n      <button (click)=\"emitClose('accept')\" [class.rtl-button]=\"dir === 'rtl'\">\n        {{ acceptLabel }}\n      </button>\n    </div>\n    <div class=\"color-picker-wrapper\">\n      <!-- <span [(colorPicker)]=\"color\"></span> -->\n      <color-picker\n        [controls]=\"colorPickerControls\"\n        [color]=\"hsva\"\n        [dir]=\"dir\"\n        (sliderChange)=\"onChangeColorPicker($event)\"\n      ></color-picker>\n    </div>\n  </ng-container>\n  <div class=\"manual-input-wrapper\" *ngIf=\"!hideTextInput\">\n    <p (click)=\"nextFormat()\" style=\"cursor: pointer;\">{{ colorFormats[format] }}</p>\n    <div class=\"g-input\">\n      <input\n        [placeholder]=\"placeholder\"\n        type=\"text\"\n        [value]=\"color\"\n        [style.font-size.px]=\"color && color.length > 23 ? 9 : 10\"\n        [style.letter-spacing.px]=\"color && color.length > 16 ? 0 : 1.5\"\n        (keyup)=\"changeColorManual(paintInput.value)\"\n        (keydown.enter)=\"emitClose('accept')\"\n        #paintInput\n      />\n    </div>\n  </div>\n</div>\n", styles: [":host{position:fixed;z-index:2001}.hidden{display:none}.button{display:flex;align-items:center;justify-content:center}.top{transform:translateY(-100%)}.opened{box-sizing:border-box;box-shadow:0 2px 4px -1px #0003,0 4px 5px #00000024,0 1px 10px #0000001f;background:#fff;width:250px;border-radius:5px;position:absolute}.opened button{border:none;font-family:inherit;font-size:12px;background-color:unset;-webkit-user-select:none;user-select:none;padding:10px;letter-spacing:1px;color:#222;border-radius:3px;line-height:20px}.opened button:hover,.opened .button:hover{background-color:#0000000d;transition:opacity .2s cubic-bezier(.35,0,.25,1),background-color .2s cubic-bezier(.35,0,.25,1);transition-property:opacity,background-color;transition-duration:.2s,.2s;transition-timing-function:cubic-bezier(.35,0,.25,1),cubic-bezier(.35,0,.25,1);transition-delay:0s,0s}.opened button:focus{outline:none}.opened .colors{display:flex;flex-wrap:wrap;align-items:center;margin:15px}.opened .colors .circle{height:34px;width:34px;box-sizing:border-box;border-radius:100%;cursor:pointer}.opened .colors .circle .add{font-size:20px;line-height:45px;text-align:center}.opened .colors .circle .selected{border:2px solid white;border-radius:100%;height:28px;width:28px;box-sizing:border-box;margin:2px}.opened .colors .circle.colornull{background:linear-gradient(135deg,rgba(236,236,236,.7) 0%,rgba(236,236,236,.7) 45%,#de0f00 50%,rgba(236,236,236,.7) 55%,rgba(236,236,236,.7) 100%)}.opened .colors .circle.wrapper{margin:0 5px 5px;flex:34px 0 0}.opened .colors .circle.button{margin:0 5px 5px}.opened .colors .circle.wrapper.color{background-image:linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0px}.opened .colors .circle-border{border:1px solid rgba(0,0,0,.03)}.opened .color-picker-wrapper{margin:5px 15px}.opened .nav-wrapper{overflow:hidden;margin:5px}.opened .nav-wrapper .round-button{padding:5px 0;width:40px;height:40px;box-sizing:border-box;border-radius:100%;text-align:center;line-height:45px;float:left;cursor:pointer}.opened .nav-wrapper button{float:right;cursor:pointer}.opened .nav-wrapper.rtl-nav .round-button{float:right}.opened .nav-wrapper.rtl-nav button{float:left}.opened .rtl-icon{transform:scaleX(-1)}.opened .manual-input-wrapper{display:flex;margin:15px;font-family:sans-serif}.opened .manual-input-wrapper p{margin:0;text-align:center;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;line-height:48px;width:145px;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.opened .manual-input-wrapper .g-input{border:1px solid #e8ebed;height:45px;border-radius:5px;width:100%}.opened .manual-input-wrapper .g-input input{font-size:9px;border:none;width:100%;text-transform:uppercase;outline:none;text-align:center;letter-spacing:1px;color:#595b65;height:100%;border-radius:5px;margin:0;padding:0}\n"], dependencies: [{ kind: "directive", type: i2.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i2.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i3.ColorPickerComponent, selector: "color-picker", inputs: ["color", "controls", "dir"], outputs: ["sliderChange", "onAlphaChange"] }], animations: [
        trigger('colorsAnimation', [
            transition('void => slide-in', [
                // Initially all colors are hidden
                query(':enter', style({ opacity: 0 }), { optional: true }),
                //slide-in animation
                query(':enter', stagger('10ms', [
                    animate('.3s ease-in', keyframes([
                        style({ opacity: 0, transform: 'translatex(-50%)', offset: 0 }),
                        style({
                            opacity: 0.5,
                            transform: 'translatex(-10px) scale(1.1)',
                            offset: 0.3,
                        }),
                        style({ opacity: 1, transform: 'translatex(0)', offset: 1 }),
                    ])),
                ]), { optional: true }),
            ]),
            //popup animation
            transition('void => popup', [
                query(':enter', style({ opacity: 0, transform: 'scale(0)' }), {
                    optional: true,
                }),
                query(':enter', stagger('10ms', [
                    animate('500ms ease-out', keyframes([
                        style({ opacity: 0.5, transform: 'scale(.5)', offset: 0.3 }),
                        style({ opacity: 1, transform: 'scale(1.1)', offset: 0.8 }),
                        style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
                    ])),
                ]), { optional: true }),
            ]),
        ]),
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: PanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-colors-panel', animations: [
                        trigger('colorsAnimation', [
                            transition('void => slide-in', [
                                // Initially all colors are hidden
                                query(':enter', style({ opacity: 0 }), { optional: true }),
                                //slide-in animation
                                query(':enter', stagger('10ms', [
                                    animate('.3s ease-in', keyframes([
                                        style({ opacity: 0, transform: 'translatex(-50%)', offset: 0 }),
                                        style({
                                            opacity: 0.5,
                                            transform: 'translatex(-10px) scale(1.1)',
                                            offset: 0.3,
                                        }),
                                        style({ opacity: 1, transform: 'translatex(0)', offset: 1 }),
                                    ])),
                                ]), { optional: true }),
                            ]),
                            //popup animation
                            transition('void => popup', [
                                query(':enter', style({ opacity: 0, transform: 'scale(0)' }), {
                                    optional: true,
                                }),
                                query(':enter', stagger('10ms', [
                                    animate('500ms ease-out', keyframes([
                                        style({ opacity: 0.5, transform: 'scale(.5)', offset: 0.3 }),
                                        style({ opacity: 1, transform: 'scale(1.1)', offset: 0.8 }),
                                        style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
                                    ])),
                                ]), { optional: true }),
                            ]),
                        ]),
                    ], template: "<div class=\"opened\" [style]=\"positionString\" [attr.dir]=\"dir\" #dialog>\n  <ng-container *ngIf=\"menu == 1\">\n    <div class=\"colors\" [@colorsAnimation]=\"colorsAnimationEffect\">\n      <ng-container *ngFor=\"let color of palette; let i = index\">\n        <div class=\"circle wrapper color\">\n          <div\n            (click)=\"onColorClick(color)\"\n            class=\"circle color circle-border\"\n            [class.colornull]=\"!color\"\n            [ngStyle]=\"getBackgroundColor(color)\"\n          >\n            <div *ngIf=\"i == this.indexSeleccionado\" class=\"selected\"></div>\n          </div>\n        </div>\n      </ng-container>\n      <div\n        style=\"background: rgb(245 245 245); position: relative\"\n        (click)=\"addColor()\"\n        *ngIf=\"!hideColorPicker && this.colorPickerControls != 'only-alpha'\"\n        class=\"circle button\"\n      >\n        <div\n          *ngIf=\"this.indexSeleccionado === undefined\"\n          style=\"\n            position: absolute;\n            height: 7px;\n            width: 7px;\n            border: 1px solid rgba(0, 0, 0, 0.03);\n            border-radius: 100%;\n            top: 0;\n            right: 0;\n          \"\n          [ngStyle]=\"getBackgroundColor(color)\"\n        ></div>\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          height=\"24px\"\n          viewBox=\"0 0 24 24\"\n          width=\"24px\"\n          fill=\"#222222\"\n        >\n          <path d=\"M24 24H0V0h24v24z\" fill=\"none\" opacity=\".87\" />\n          <path d=\"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z\" />\n        </svg>\n        <!-- <div class=\"add\">\n          <icons icon=\"add\"></icons>\n        </div> -->\n      </div>\n      <color-picker\n        *ngIf=\"!hideColorPicker && this.colorPickerControls == 'only-alpha'\"\n        [controls]=\"colorPickerControls\"\n        [color]=\"hsva\"\n        [dir]=\"dir\"\n        (colorChange)=\"onChangeColorPicker($event)\"\n        (onAlphaChange)=\"onAlphaChange($event)\"\n      ></color-picker>\n    </div>\n  </ng-container>\n  <ng-container *ngIf=\"menu == 2\">\n    <div class=\"colors\" [@colorsAnimation]=\"colorsAnimationEffect\">\n      <div class=\"circle wrapper\">\n        <div (click)=\"onClickBack()\" class=\"add\">\n          <svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            width=\"24\"\n            height=\"24\"\n            viewBox=\"0 0 24 24\"\n            [class.rtl-icon]=\"dir === 'rtl'\"\n          >\n            <path d=\"M0 0h24v24H0z\" fill=\"none\" />\n            <path\n              d=\"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z\"\n            />\n          </svg>\n        </div>\n      </div>\n\n      <ng-container *ngFor=\"let variant of variants\">\n        <div class=\"circle wrapper color\">\n          <div\n            [class.colornull]=\"!variant\"\n            (click)=\"changeColor(variant)\"\n            class=\"circle circle-border\"\n            [ngStyle]=\"{ background: variant }\"\n          >\n            <div *ngIf=\"isSelected(variant)\" class=\"selected\"></div>\n          </div>\n        </div>\n      </ng-container>\n    </div>\n  </ng-container>\n  <ng-container *ngIf=\"menu == 3\">\n    <div class=\"nav-wrapper\" [class.rtl-nav]=\"dir === 'rtl'\">\n      <div\n        (click)=\"onClickBack()\"\n        class=\"round-button button\"\n        [class.rtl-button]=\"dir === 'rtl'\"\n      >\n        <svg\n          xmlns=\"http://www.w3.org/2000/svg\"\n          width=\"24\"\n          height=\"24\"\n          viewBox=\"0 0 24 24\"\n          [class.rtl-icon]=\"dir === 'rtl'\"\n        >\n          <path d=\"M0 0h24v24H0z\" fill=\"none\" />\n          <path\n            d=\"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z\"\n          />\n        </svg>\n      </div>\n      <button (click)=\"emitClose('cancel')\" [class.rtl-button]=\"dir === 'rtl'\">\n        {{ cancelLabel }}\n      </button>\n      <button (click)=\"emitClose('accept')\" [class.rtl-button]=\"dir === 'rtl'\">\n        {{ acceptLabel }}\n      </button>\n    </div>\n    <div class=\"color-picker-wrapper\">\n      <!-- <span [(colorPicker)]=\"color\"></span> -->\n      <color-picker\n        [controls]=\"colorPickerControls\"\n        [color]=\"hsva\"\n        [dir]=\"dir\"\n        (sliderChange)=\"onChangeColorPicker($event)\"\n      ></color-picker>\n    </div>\n  </ng-container>\n  <div class=\"manual-input-wrapper\" *ngIf=\"!hideTextInput\">\n    <p (click)=\"nextFormat()\" style=\"cursor: pointer;\">{{ colorFormats[format] }}</p>\n    <div class=\"g-input\">\n      <input\n        [placeholder]=\"placeholder\"\n        type=\"text\"\n        [value]=\"color\"\n        [style.font-size.px]=\"color && color.length > 23 ? 9 : 10\"\n        [style.letter-spacing.px]=\"color && color.length > 16 ? 0 : 1.5\"\n        (keyup)=\"changeColorManual(paintInput.value)\"\n        (keydown.enter)=\"emitClose('accept')\"\n        #paintInput\n      />\n    </div>\n  </div>\n</div>\n", styles: [":host{position:fixed;z-index:2001}.hidden{display:none}.button{display:flex;align-items:center;justify-content:center}.top{transform:translateY(-100%)}.opened{box-sizing:border-box;box-shadow:0 2px 4px -1px #0003,0 4px 5px #00000024,0 1px 10px #0000001f;background:#fff;width:250px;border-radius:5px;position:absolute}.opened button{border:none;font-family:inherit;font-size:12px;background-color:unset;-webkit-user-select:none;user-select:none;padding:10px;letter-spacing:1px;color:#222;border-radius:3px;line-height:20px}.opened button:hover,.opened .button:hover{background-color:#0000000d;transition:opacity .2s cubic-bezier(.35,0,.25,1),background-color .2s cubic-bezier(.35,0,.25,1);transition-property:opacity,background-color;transition-duration:.2s,.2s;transition-timing-function:cubic-bezier(.35,0,.25,1),cubic-bezier(.35,0,.25,1);transition-delay:0s,0s}.opened button:focus{outline:none}.opened .colors{display:flex;flex-wrap:wrap;align-items:center;margin:15px}.opened .colors .circle{height:34px;width:34px;box-sizing:border-box;border-radius:100%;cursor:pointer}.opened .colors .circle .add{font-size:20px;line-height:45px;text-align:center}.opened .colors .circle .selected{border:2px solid white;border-radius:100%;height:28px;width:28px;box-sizing:border-box;margin:2px}.opened .colors .circle.colornull{background:linear-gradient(135deg,rgba(236,236,236,.7) 0%,rgba(236,236,236,.7) 45%,#de0f00 50%,rgba(236,236,236,.7) 55%,rgba(236,236,236,.7) 100%)}.opened .colors .circle.wrapper{margin:0 5px 5px;flex:34px 0 0}.opened .colors .circle.button{margin:0 5px 5px}.opened .colors .circle.wrapper.color{background-image:linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%);background-size:16px 16px;background-position:0 0,0 8px,8px -8px,-8px 0px}.opened .colors .circle-border{border:1px solid rgba(0,0,0,.03)}.opened .color-picker-wrapper{margin:5px 15px}.opened .nav-wrapper{overflow:hidden;margin:5px}.opened .nav-wrapper .round-button{padding:5px 0;width:40px;height:40px;box-sizing:border-box;border-radius:100%;text-align:center;line-height:45px;float:left;cursor:pointer}.opened .nav-wrapper button{float:right;cursor:pointer}.opened .nav-wrapper.rtl-nav .round-button{float:right}.opened .nav-wrapper.rtl-nav button{float:left}.opened .rtl-icon{transform:scaleX(-1)}.opened .manual-input-wrapper{display:flex;margin:15px;font-family:sans-serif}.opened .manual-input-wrapper p{margin:0;text-align:center;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;line-height:48px;width:145px;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}.opened .manual-input-wrapper .g-input{border:1px solid #e8ebed;height:45px;border-radius:5px;width:100%}.opened .manual-input-wrapper .g-input input{font-size:9px;border:none;width:100%;text-transform:uppercase;outline:none;text-align:center;letter-spacing:1px;color:#595b65;height:100%;border-radius:5px;margin:0;padding:0}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.ConverterService }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { click: [{
                type: HostListener,
                args: ['document:mousedown', ['$event']]
            }], onScroll: [{
                type: HostListener,
                args: ['document:scroll']
            }], onResize: [{
                type: HostListener,
                args: ['window:resize']
            }], top: [{
                type: HostBinding,
                args: ['style.top.px']
            }], left: [{
                type: HostBinding,
                args: ['style.left.px']
            }], panelRef: [{
                type: ViewChild,
                args: ['dialog']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNvbG9ycy9zcmMvbGliL2NvbXBvbmVudHMvcGFuZWwvcGFuZWwuY29tcG9uZW50LnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWNvbG9ycy9zcmMvbGliL2NvbXBvbmVudHMvcGFuZWwvcGFuZWwuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFNVCxTQUFTLEVBRVQsWUFBWSxFQUNaLFdBQVcsR0FDWixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsT0FBTyxFQUNQLFVBQVUsRUFDVixLQUFLLEVBQ0wsS0FBSyxFQUNMLE9BQU8sRUFDUCxPQUFPLEVBQ1AsU0FBUyxHQUNWLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFaEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQzs7Ozs7QUFzRHBELE1BQU0sT0FBTyxjQUFjO0lBRXpCLEtBQUssQ0FBQyxLQUFLO1FBQ1QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBR0QsUUFBUTtRQUNOLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDMUIs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QyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUU7b0NBQzVELFFBQVEsRUFBRSxJQUFJO2lDQUNmLENBQUM7Z0NBQ0YsS0FBSyxDQUNILFFBQVEsRUFDUixPQUFPLENBQUMsTUFBTSxFQUFFO29DQUNkLE9BQU8sQ0FDTCxnQkFBZ0IsRUFDaEIsU0FBUyxDQUFDO3dDQUNSLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7d0NBQzVELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7d0NBQzNELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7cUNBQ3hELENBQUMsQ0FDSDtpQ0FDRixDQUFDLEVBQ0YsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQ25COzZCQUNGLENBQUM7eUJBQ0gsQ0FBQztxQkFDSDt1SUFJRCxLQUFLO3NCQURKLFlBQVk7dUJBQUMsb0JBQW9CLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBUTlDLFFBQVE7c0JBRFAsWUFBWTt1QkFBQyxpQkFBaUI7Z0JBSy9CLFFBQVE7c0JBRFAsWUFBWTt1QkFBQyxlQUFlO2dCQUtPLEdBQUc7c0JBQXRDLFdBQVc7dUJBQUMsY0FBYztnQkFDVSxJQUFJO3NCQUF4QyxXQUFXO3VCQUFDLGVBQWU7Z0JBQ1AsUUFBUTtzQkFBNUIsU0FBUzt1QkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50LFxuICBPbkluaXQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIEV2ZW50RW1pdHRlcixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIFZpZXdDaGlsZCxcbiAgRWxlbWVudFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBIb3N0QmluZGluZyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICB0cmlnZ2VyLFxuICB0cmFuc2l0aW9uLFxuICBxdWVyeSxcbiAgc3R5bGUsXG4gIHN0YWdnZXIsXG4gIGFuaW1hdGUsXG4gIGtleWZyYW1lcyxcbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQgeyBpc0Rlc2NlbmRhbnRPclNhbWUgfSBmcm9tICcuLi8uLi9oZWxwZXJzL2hlbHBlcnMnO1xuaW1wb3J0IHsgQ29sb3JGb3JtYXRzIH0gZnJvbSAnLi4vLi4vZW51bXMvZm9ybWF0cyc7XG5pbXBvcnQgeyBDb252ZXJ0ZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvY29udmVydGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgZGVmYXVsdENvbG9ycyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZGVmYXVsdC1jb2xvcnMnO1xuaW1wb3J0IHsgZm9ybWF0cyB9IGZyb20gJy4uLy4uL2hlbHBlcnMvZm9ybWF0cyc7XG5pbXBvcnQgeyBOZ3hDb2xvcnNUcmlnZ2VyRGlyZWN0aXZlIH0gZnJvbSAnLi4vLi4vZGlyZWN0aXZlcy9uZ3gtY29sb3JzLXRyaWdnZXIuZGlyZWN0aXZlJztcbmltcG9ydCB7IEhzdmEgfSBmcm9tICcuLi8uLi9jbGFzZXMvZm9ybWF0cyc7XG5pbXBvcnQgeyBOZ3hDb2xvcnNDb2xvciB9IGZyb20gJy4uLy4uL2NsYXNlcy9jb2xvcic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1jb2xvcnMtcGFuZWwnLFxuICB0ZW1wbGF0ZVVybDogJy4vcGFuZWwuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wYW5lbC5jb21wb25lbnQuc2NzcyddLFxuICBhbmltYXRpb25zOiBbXG4gICAgdHJpZ2dlcignY29sb3JzQW5pbWF0aW9uJywgW1xuICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiBzbGlkZS1pbicsIFtcbiAgICAgICAgLy8gSW5pdGlhbGx5IGFsbCBjb2xvcnMgYXJlIGhpZGRlblxuICAgICAgICBxdWVyeSgnOmVudGVyJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLCB7IG9wdGlvbmFsOiB0cnVlIH0pLFxuICAgICAgICAvL3NsaWRlLWluIGFuaW1hdGlvblxuICAgICAgICBxdWVyeShcbiAgICAgICAgICAnOmVudGVyJyxcbiAgICAgICAgICBzdGFnZ2VyKCcxMG1zJywgW1xuICAgICAgICAgICAgYW5pbWF0ZShcbiAgICAgICAgICAgICAgJy4zcyBlYXNlLWluJyxcbiAgICAgICAgICAgICAga2V5ZnJhbWVzKFtcbiAgICAgICAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZXgoLTUwJSknLCBvZmZzZXQ6IDAgfSksXG4gICAgICAgICAgICAgICAgc3R5bGUoe1xuICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRleCgtMTBweCkgc2NhbGUoMS4xKScsXG4gICAgICAgICAgICAgICAgICBvZmZzZXQ6IDAuMyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDEsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZXgoMCknLCBvZmZzZXQ6IDEgfSksXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICApLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIHsgb3B0aW9uYWw6IHRydWUgfVxuICAgICAgICApLFxuICAgICAgXSksXG4gICAgICAvL3BvcHVwIGFuaW1hdGlvblxuICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiBwb3B1cCcsIFtcbiAgICAgICAgcXVlcnkoJzplbnRlcicsIHN0eWxlKHsgb3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGUoMCknIH0pLCB7XG4gICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgICBxdWVyeShcbiAgICAgICAgICAnOmVudGVyJyxcbiAgICAgICAgICBzdGFnZ2VyKCcxMG1zJywgW1xuICAgICAgICAgICAgYW5pbWF0ZShcbiAgICAgICAgICAgICAgJzUwMG1zIGVhc2Utb3V0JyxcbiAgICAgICAgICAgICAga2V5ZnJhbWVzKFtcbiAgICAgICAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAuNSwgdHJhbnNmb3JtOiAnc2NhbGUoLjUpJywgb2Zmc2V0OiAwLjMgfSksXG4gICAgICAgICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICdzY2FsZSgxLjEpJywgb2Zmc2V0OiAwLjggfSksXG4gICAgICAgICAgICAgICAgc3R5bGUoeyBvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICdzY2FsZSgxKScsIG9mZnNldDogMSB9KSxcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgeyBvcHRpb25hbDogdHJ1ZSB9XG4gICAgICAgICksXG4gICAgICBdKSxcbiAgICBdKSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUGFuZWxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZWRvd24nLCBbJyRldmVudCddKVxuICBjbGljayhldmVudCkge1xuICAgIGlmICh0aGlzLmlzT3V0c2lkZShldmVudCkpIHtcbiAgICAgIHRoaXMuZW1pdENsb3NlKCdjYW5jZWwnKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDpzY3JvbGwnKVxuICBvblNjcm9sbCgpIHtcbiAgICB0aGlzLm9uU2NyZWVuTW92ZW1lbnQoKTtcbiAgfVxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJylcbiAgb25SZXNpemUoKSB7XG4gICAgdGhpcy5vblNjcmVlbk1vdmVtZW50KCk7XG4gIH1cblxuICBASG9zdEJpbmRpbmcoJ3N0eWxlLnRvcC5weCcpIHB1YmxpYyB0b3A6IG51bWJlcjtcbiAgQEhvc3RCaW5kaW5nKCdzdHlsZS5sZWZ0LnB4JykgcHVibGljIGxlZnQ6IG51bWJlcjtcbiAgQFZpZXdDaGlsZCgnZGlhbG9nJykgcGFuZWxSZWY6IEVsZW1lbnRSZWY7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBzZXJ2aWNlOiBDb252ZXJ0ZXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZlxuICApIHsgfVxuXG4gIHB1YmxpYyBjb2xvciA9ICcjMDAwMDAwJztcbiAgcHVibGljIHByZXZpZXdDb2xvcjogc3RyaW5nID0gJyMwMDAwMDAnO1xuICBwdWJsaWMgaHN2YSA9IG5ldyBIc3ZhKDAsIDEsIDEsIDEpO1xuXG4gIHB1YmxpYyBjb2xvcnNBbmltYXRpb25FZmZlY3QgPSAnc2xpZGUtaW4nO1xuXG4gIHB1YmxpYyBwYWxldHRlID0gZGVmYXVsdENvbG9ycztcbiAgcHVibGljIHZhcmlhbnRzID0gW107XG5cbiAgcHVibGljIHVzZXJGb3JtYXRzOiBzdHJpbmdbXSA9IFtdO1xuICBwdWJsaWMgY29sb3JGb3JtYXRzID0gZm9ybWF0cztcbiAgcHVibGljIGZvcm1hdDogQ29sb3JGb3JtYXRzID0gQ29sb3JGb3JtYXRzLkhFWDtcbiAgcHVibGljIGZvcm1hdE1hcCA9IHtcbiAgICAnaGV4JzogQ29sb3JGb3JtYXRzLkhFWCxcbiAgICAncmdiYSc6IENvbG9yRm9ybWF0cy5SR0JBLFxuICAgICdoc2xhJzogQ29sb3JGb3JtYXRzLkhTTEEsXG4gICAgJ2NteWsnOiBDb2xvckZvcm1hdHMuQ01ZS1xuICB9XG5cbiAgcHVibGljIGNhbkNoYW5nZUZvcm1hdDogYm9vbGVhbiA9IHRydWU7XG5cbiAgcHVibGljIG1lbnUgPSAxO1xuXG4gIHB1YmxpYyBoaWRlQ29sb3JQaWNrZXI6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIGhpZGVUZXh0SW5wdXQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIGFjY2VwdExhYmVsOiBzdHJpbmc7XG4gIHB1YmxpYyBjYW5jZWxMYWJlbDogc3RyaW5nO1xuICBwdWJsaWMgY29sb3JQaWNrZXJDb250cm9sczogJ2RlZmF1bHQnIHwgJ29ubHktYWxwaGEnIHwgJ25vLWFscGhhJyA9ICdkZWZhdWx0JztcbiAgcHVibGljIGRpcjogJ2x0cicgfCAncnRsJyA9ICdsdHInO1xuICBwcml2YXRlIHRyaWdnZXJJbnN0YW5jZTogTmd4Q29sb3JzVHJpZ2dlckRpcmVjdGl2ZTtcbiAgcHJpdmF0ZSBUcmlnZ2VyQkJveDtcbiAgcHVibGljIGlzU2VsZWN0ZWRDb2xvckluUGFsZXR0ZTogYm9vbGVhbjtcbiAgcHVibGljIGluZGV4U2VsZWNjaW9uYWRvO1xuICBwdWJsaWMgcG9zaXRpb25TdHJpbmc7XG4gIHB1YmxpYyB0ZW1wb3JhbENvbG9yO1xuICBwdWJsaWMgYmFja3VwQ29sb3I7XG4gIHB1YmxpYyBwbGFjZWhvbGRlciA9ICcjRkZGRkZGJztcblxuICBwdWJsaWMgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICAgIHRoaXMuaHN2YSA9IHRoaXMuc2VydmljZS5zdHJpbmdUb0hzdmEodGhpcy5jb2xvcik7XG4gICAgdGhpcy5pbmRleFNlbGVjY2lvbmFkbyA9IHRoaXMuZmluZEluZGV4U2VsZWN0ZWRDb2xvcih0aGlzLnBhbGV0dGUpO1xuICB9XG4gIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5zZXRQb3NpdGlvblkoKTtcbiAgfVxuXG4gIHByaXZhdGUgb25TY3JlZW5Nb3ZlbWVudCgpIHtcbiAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gICAgdGhpcy5zZXRQb3NpdGlvblkoKTtcbiAgICBpZiAoIXRoaXMucGFuZWxSZWYubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2l0aW9uKSB7XG4gICAgICB0aGlzLnBhbmVsUmVmLm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9ICd0cmFuc2Zvcm0gMC41cyBlYXNlLW91dCc7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kSW5kZXhTZWxlY3RlZENvbG9yKGNvbG9ycyk6IG51bWJlciB7XG4gICAgbGV0IHJlc3VsdEluZGV4ID0gdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLmNvbG9yKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHRoaXMuc2VydmljZS5zdHJpbmdUb0Zvcm1hdCh0aGlzLmNvbG9yLCBDb2xvckZvcm1hdHMuSEVYKSA9PVxuICAgICAgICAgICAgdGhpcy5zZXJ2aWNlLnN0cmluZ1RvRm9ybWF0KGNvbG9yLCBDb2xvckZvcm1hdHMuSEVYKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmVzdWx0SW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjb2xvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jb2xvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5maW5kSW5kZXhTZWxlY3RlZENvbG9yKGNvbG9yLnZhcmlhbnRzKSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlc3VsdEluZGV4ID0gaTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdEluZGV4O1xuICB9XG5cbiAgcHVibGljIGluaWNpYXRlKFxuICAgIHRyaWdnZXJJbnN0YW5jZTogTmd4Q29sb3JzVHJpZ2dlckRpcmVjdGl2ZSxcbiAgICB0cmlnZ2VyRWxlbWVudFJlZixcbiAgICBjb2xvcixcbiAgICBwYWxldHRlLFxuICAgIGFuaW1hdGlvbixcbiAgICBmb3JtYXQ6IHN0cmluZyxcbiAgICBoaWRlVGV4dElucHV0OiBib29sZWFuLFxuICAgIGhpZGVDb2xvclBpY2tlcjogYm9vbGVhbixcbiAgICBhY2NlcHRMYWJlbDogc3RyaW5nLFxuICAgIGNhbmNlbExhYmVsOiBzdHJpbmcsXG4gICAgY29sb3JQaWNrZXJDb250cm9sczogJ2RlZmF1bHQnIHwgJ29ubHktYWxwaGEnIHwgJ25vLWFscGhhJyxcbiAgICBwb3NpdGlvbjogJ3RvcCcgfCAnYm90dG9tJyxcbiAgICB1c2VyRm9ybWF0czogc3RyaW5nW10gPSBbXSxcbiAgICBkaXI6ICdsdHInIHwgJ3J0bCcgPSAnbHRyJyxcbiAgKSB7XG4gICAgdGhpcy5jb2xvclBpY2tlckNvbnRyb2xzID0gY29sb3JQaWNrZXJDb250cm9scztcbiAgICB0aGlzLnRyaWdnZXJJbnN0YW5jZSA9IHRyaWdnZXJJbnN0YW5jZTtcbiAgICB0aGlzLlRyaWdnZXJCQm94ID0gdHJpZ2dlckVsZW1lbnRSZWY7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuaGlkZUNvbG9yUGlja2VyID0gaGlkZUNvbG9yUGlja2VyO1xuICAgIHRoaXMuaGlkZVRleHRJbnB1dCA9IGhpZGVUZXh0SW5wdXQ7XG4gICAgdGhpcy5hY2NlcHRMYWJlbCA9IGFjY2VwdExhYmVsO1xuICAgIHRoaXMuY2FuY2VsTGFiZWwgPSBjYW5jZWxMYWJlbDtcblxuICAgIGlmICh1c2VyRm9ybWF0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGFsbEZvcm1hdHNWYWxpZCA9IHVzZXJGb3JtYXRzLmV2ZXJ5KGZydCA9PiBmb3JtYXRzLmluY2x1ZGVzKGZydCkpO1xuICAgICAgaWYgKGFsbEZvcm1hdHNWYWxpZCkge1xuICAgICAgICB0aGlzLmNvbG9yRm9ybWF0cyA9IHVzZXJGb3JtYXRzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmb3JtYXQpIHtcbiAgICAgIGlmICh0aGlzLmNvbG9yRm9ybWF0cy5pbmNsdWRlcyhmb3JtYXQpKSB7XG4gICAgICAgIHRoaXMuZm9ybWF0ID0gdGhpcy5jb2xvckZvcm1hdHMuaW5kZXhPZihmb3JtYXQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIHRoaXMuY2FuQ2hhbmdlRm9ybWF0ID0gZmFsc2U7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLnNlcnZpY2UuZ2V0Rm9ybWF0QnlTdHJpbmcodGhpcy5jb2xvcikgIT0gZm9ybWF0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5zZXRDb2xvcih0aGlzLnNlcnZpY2Uuc3RyaW5nVG9Ic3ZhKHRoaXMuY29sb3IpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRm9ybWF0IHByb3ZpZGVkIGlzIGludmFsaWQsIHVzaW5nIEhFWCcpO1xuICAgICAgICB0aGlzLmZvcm1hdCA9IENvbG9yRm9ybWF0cy5IRVg7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9ybWF0ID0gdGhpcy5jb2xvckZvcm1hdHMuaW5kZXhPZih0aGlzLnNlcnZpY2UuZ2V0Rm9ybWF0QnlTdHJpbmcodGhpcy5jb2xvcikpO1xuICAgICAgaWYgKHRoaXMuZm9ybWF0IDwgMCkge1xuICAgICAgICB0aGlzLmZvcm1hdCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5wcmV2aWV3Q29sb3IgPSB0aGlzLmNvbG9yO1xuICAgIHRoaXMucGFsZXR0ZSA9IHBhbGV0dGUgPz8gZGVmYXVsdENvbG9ycztcbiAgICB0aGlzLmNvbG9yc0FuaW1hdGlvbkVmZmVjdCA9IGFuaW1hdGlvbjtcbiAgICB0aGlzLmRpciA9IGRpcjtcbiAgICBpZiAocG9zaXRpb24gPT0gJ3RvcCcpIHtcbiAgICAgIGxldCBUcmlnZ2VyQkJveCA9IHRoaXMuVHJpZ2dlckJCb3gubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHRoaXMucG9zaXRpb25TdHJpbmcgPVxuICAgICAgICAndHJhbnNmb3JtOiB0cmFuc2xhdGVZKGNhbGMoIC0xMDAlIC0gJyArIFRyaWdnZXJCQm94LmhlaWdodCArICdweCApKSc7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNldFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLlRyaWdnZXJCQm94KSB7XG4gICAgICBjb25zdCBwYW5lbFdpZHRoID0gMjUwO1xuICAgICAgY29uc3QgaXNEb2N1bWVudFJUTCA9IGRvY3VtZW50LmRpciA9PT0gJ3J0bCc7XG4gICAgICBjb25zdCB2aWV3cG9ydE9mZnNldCA9IHRoaXMuVHJpZ2dlckJCb3gubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgdGhpcy50b3AgPSB2aWV3cG9ydE9mZnNldC50b3AgKyB2aWV3cG9ydE9mZnNldC5oZWlnaHQ7XG5cbiAgICAgIGlmIChpc0RvY3VtZW50UlRMKSB7XG4gICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC5sZWZ0ICsgcGFuZWxXaWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgdGhpcy5sZWZ0ID0gdmlld3BvcnRPZmZzZXQubGVmdCA8IHBhbmVsV2lkdGhcbiAgICAgICAgICAgID8gd2luZG93LmlubmVyV2lkdGggLyAyICsgcGFuZWxXaWR0aCAvIDJcbiAgICAgICAgICAgIDogdmlld3BvcnRPZmZzZXQubGVmdCArIHBhbmVsV2lkdGg7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmxlZnQgPSB2aWV3cG9ydE9mZnNldC5sZWZ0ICsgcGFuZWxXaWR0aDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHZpZXdwb3J0T2Zmc2V0LmxlZnQgKyBwYW5lbFdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICB0aGlzLmxlZnQgPSB2aWV3cG9ydE9mZnNldC5yaWdodCA8IHBhbmVsV2lkdGhcbiAgICAgICAgICAgID8gd2luZG93LmlubmVyV2lkdGggLyAyIC0gcGFuZWxXaWR0aCAvIDJcbiAgICAgICAgICAgIDogdmlld3BvcnRPZmZzZXQucmlnaHQgLSBwYW5lbFdpZHRoO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5sZWZ0ID0gdmlld3BvcnRPZmZzZXQubGVmdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0UG9zaXRpb25ZKCk6IHZvaWQge1xuICAgIGNvbnN0IHRyaWdnZXJCQm94ID0gdGhpcy5UcmlnZ2VyQkJveC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBhbmVsQkJveCA9IHRoaXMucGFuZWxSZWYubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBwYW5lbEhlaWdodCA9IHBhbmVsQkJveC5oZWlnaHQ7XG4gICAgLy8gQ2hlY2sgZm9yIHNwYWNlIGJlbG93IHRoZSB0cmlnZ2VyXG4gICAgaWYgKHRyaWdnZXJCQm94LmJvdHRvbSArIHBhbmVsSGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAvLyB0aGVyZSBpcyBubyBzcGFjZSwgbW92ZSBwYW5lbCBvdmVyIHRoZSB0cmlnZ2VyXG4gICAgICB0aGlzLnBvc2l0aW9uU3RyaW5nID1cbiAgICAgICAgdHJpZ2dlckJCb3gudG9wIDwgcGFuZWxCQm94LmhlaWdodFxuICAgICAgICAgID8gJ3RyYW5zZm9ybTogdHJhbnNsYXRlWSgtJyArIHRyaWdnZXJCQm94LmJvdHRvbSArICdweCApOydcbiAgICAgICAgICA6ICd0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoY2FsYyggLTEwMCUgLSAnICtcbiAgICAgICAgICB0cmlnZ2VyQkJveC5oZWlnaHQgK1xuICAgICAgICAgICdweCApKTsnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvc2l0aW9uU3RyaW5nID0gJyc7XG4gICAgfVxuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBoYXNWYXJpYW50KGNvbG9yKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLnByZXZpZXdDb2xvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgdHlwZW9mIGNvbG9yICE9ICdzdHJpbmcnICYmXG4gICAgICBjb2xvci52YXJpYW50cy5zb21lKFxuICAgICAgICAodikgPT4gdi50b1VwcGVyQ2FzZSgpID09IHRoaXMucHJldmlld0NvbG9yLnRvVXBwZXJDYXNlKClcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGlzU2VsZWN0ZWQoY29sb3IpIHtcbiAgICBpZiAoIXRoaXMucHJldmlld0NvbG9yKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgY29sb3IgPT0gJ3N0cmluZycgJiZcbiAgICAgIGNvbG9yLnRvVXBwZXJDYXNlKCkgPT0gdGhpcy5wcmV2aWV3Q29sb3IudG9VcHBlckNhc2UoKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0QmFja2dyb3VuZENvbG9yKGNvbG9yKSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgYmFja2dyb3VuZDogY29sb3IgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgYmFja2dyb3VuZDogY29sb3I/LnByZXZpZXcgfTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25BbHBoYUNoYW5nZShldmVudCkge1xuICAgIHRoaXMucGFsZXR0ZSA9IHRoaXMuQ2hhbmdlQWxwaGFPblBhbGV0dGUoZXZlbnQsIHRoaXMucGFsZXR0ZSk7XG4gIH1cblxuICBwcml2YXRlIENoYW5nZUFscGhhT25QYWxldHRlKFxuICAgIGFscGhhLFxuICAgIGNvbG9yczogQXJyYXk8c3RyaW5nIHwgTmd4Q29sb3JzQ29sb3I+XG4gICk6IEFycmF5PGFueT4ge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY29sb3IgPSBjb2xvcnNbaV07XG4gICAgICBpZiAodHlwZW9mIGNvbG9yID09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxldCBuZXdDb2xvciA9IHRoaXMuc2VydmljZS5zdHJpbmdUb0hzdmEoY29sb3IpO1xuICAgICAgICBuZXdDb2xvci5vbkFscGhhQ2hhbmdlKGFscGhhKTtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zZXJ2aWNlLnRvRm9ybWF0KG5ld0NvbG9yLCB0aGlzLmZvcm1hdCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5ld0NvbG9yID0gbmV3IE5neENvbG9yc0NvbG9yKCk7XG4gICAgICAgIGxldCBuZXdDb2xvclByZXZpZXcgPSB0aGlzLnNlcnZpY2Uuc3RyaW5nVG9Ic3ZhKGNvbG9yLnByZXZpZXcpO1xuICAgICAgICBuZXdDb2xvclByZXZpZXcub25BbHBoYUNoYW5nZShhbHBoYSk7XG4gICAgICAgIG5ld0NvbG9yLnByZXZpZXcgPSB0aGlzLnNlcnZpY2UudG9Gb3JtYXQobmV3Q29sb3JQcmV2aWV3LCB0aGlzLmZvcm1hdCk7XG4gICAgICAgIG5ld0NvbG9yLnZhcmlhbnRzID0gdGhpcy5DaGFuZ2VBbHBoYU9uUGFsZXR0ZShhbHBoYSwgY29sb3IudmFyaWFudHMpO1xuICAgICAgICByZXN1bHQucHVzaChuZXdDb2xvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIGNvbG9yIGZyb20gZGVmYXVsdCBjb2xvcnNcbiAgICogQHBhcmFtIHN0cmluZyBjb2xvclxuICAgKi9cbiAgcHVibGljIGNoYW5nZUNvbG9yKGNvbG9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldENvbG9yKHRoaXMuc2VydmljZS5zdHJpbmdUb0hzdmEoY29sb3IpKTtcbiAgICAvLyB0aGlzLnRyaWdnZXJJbnN0YW5jZS5vbkNoYW5nZSgpO1xuICAgIHRoaXMuZW1pdENsb3NlKCdhY2NlcHQnKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNoYW5nZUNvbG9yUGlja2VyKGV2ZW50OiBIc3ZhKSB7XG4gICAgdGhpcy50ZW1wb3JhbENvbG9yID0gZXZlbnQ7XG4gICAgdGhpcy5jb2xvciA9IHRoaXMuc2VydmljZS50b0Zvcm1hdChldmVudCwgdGhpcy5mb3JtYXQpO1xuICAgIC8vIHRoaXMuc2V0Q29sb3IoZXZlbnQpO1xuICAgIHRoaXMudHJpZ2dlckluc3RhbmNlLnNsaWRlckNoYW5nZShcbiAgICAgIHRoaXMuc2VydmljZS50b0Zvcm1hdChldmVudCwgdGhpcy5mb3JtYXQpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBjaGFuZ2VDb2xvck1hbnVhbChjb2xvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wcmV2aWV3Q29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLnN0cmluZ1RvSHN2YShjb2xvcik7XG4gICAgdGhpcy5zZXRQcmV2aWV3Q29sb3IodGhpcy5oc3ZhKTtcbiAgICB0aGlzLnRlbXBvcmFsQ29sb3IgPSB0aGlzLmhzdmE7XG4gICAgdGhpcy50cmlnZ2VySW5zdGFuY2Uuc2V0Q29sb3IodGhpcy5jb2xvciwgdGhpcy5wcmV2aWV3Q29sb3IpO1xuICAgIC8vIHRoaXMudHJpZ2dlckluc3RhbmNlLm9uQ2hhbmdlKCk7XG4gIH1cblxuICBzZXRDb2xvcih2YWx1ZTogSHN2YSwgY29sb3JJbmRleDogbnVtYmVyID0gLTEpIHtcbiAgICB0aGlzLmhzdmEgPSB2YWx1ZTtcblxuICAgIGxldCBmb3JtYXROYW1lID0gdGhpcy5jb2xvckZvcm1hdHNbdGhpcy5mb3JtYXRdO1xuICAgIGxldCBpbmRleCA9IGNvbG9ySW5kZXhcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICBpbmRleCA9IHRoaXMuZm9ybWF0TWFwW2Zvcm1hdE5hbWVdO1xuICAgIH1cblxuICAgIHRoaXMuY29sb3IgPSB0aGlzLnNlcnZpY2UudG9Gb3JtYXQodmFsdWUsIGluZGV4KTtcbiAgICB0aGlzLnNldFByZXZpZXdDb2xvcih2YWx1ZSk7XG4gICAgdGhpcy50cmlnZ2VySW5zdGFuY2Uuc2V0Q29sb3IodGhpcy5jb2xvciwgdGhpcy5wcmV2aWV3Q29sb3IpO1xuICB9XG5cbiAgc2V0UHJldmlld0NvbG9yKHZhbHVlOiBIc3ZhKSB7XG4gICAgdGhpcy5wcmV2aWV3Q29sb3IgPSB2YWx1ZVxuICAgICAgPyB0aGlzLnNlcnZpY2UuaHN2YVRvUmdiYSh2YWx1ZSkudG9TdHJpbmcoKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH1cbiAgaHN2YVRvUmdiYTtcbiAgb25DaGFuZ2UoKSB7XG4gICAgLy8gdGhpcy50cmlnZ2VySW5zdGFuY2Uub25DaGFuZ2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNvbG9yQ2xpY2soY29sb3IpIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09ICdzdHJpbmcnIHx8IGNvbG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY2hhbmdlQ29sb3IoY29sb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhcmlhbnRzID0gY29sb3IudmFyaWFudHM7XG4gICAgICB0aGlzLm1lbnUgPSAyO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhZGRDb2xvcigpIHtcbiAgICB0aGlzLm1lbnUgPSAzO1xuICAgIHRoaXMuYmFja3VwQ29sb3IgPSB0aGlzLmNvbG9yO1xuICAgIC8vIHRoaXMuY29sb3IgPSBcIiNGRjAwMDBcIjtcbiAgICB0aGlzLnRlbXBvcmFsQ29sb3IgPSB0aGlzLnNlcnZpY2Uuc3RyaW5nVG9Ic3ZhKHRoaXMuY29sb3IpO1xuICB9XG5cbiAgcHVibGljIG5leHRGb3JtYXQoKSB7XG4gICAgaWYgKHRoaXMuY2FuQ2hhbmdlRm9ybWF0KSB7XG4gICAgICB0aGlzLmZvcm1hdCA9ICh0aGlzLmZvcm1hdCArIDEpICUgdGhpcy5jb2xvckZvcm1hdHMubGVuZ3RoO1xuXG4gICAgICBsZXQgZm9ybWF0TmFtZSA9IHRoaXMuY29sb3JGb3JtYXRzW3RoaXMuZm9ybWF0XTtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMuZm9ybWF0TWFwW2Zvcm1hdE5hbWVdO1xuXG4gICAgICB0aGlzLnNldENvbG9yKHRoaXMuaHN2YSwgaW5kZXgpO1xuICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IHRoaXMuc2VydmljZS50b0Zvcm1hdChcbiAgICAgICAgbmV3IEhzdmEoMCwgMCwgMSwgMSksXG4gICAgICAgIGluZGV4XG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBlbWl0Q2xvc2Uoc3RhdHVzOiAnY2FuY2VsJyB8ICdhY2NlcHQnKSB7XG4gICAgaWYgKHRoaXMubWVudSA9PSAzKSB7XG4gICAgICBpZiAoc3RhdHVzID09ICdjYW5jZWwnKSB7XG4gICAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSAnYWNjZXB0Jykge1xuICAgICAgICB0aGlzLnNldENvbG9yKHRoaXMudGVtcG9yYWxDb2xvcik7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHJpZ2dlckluc3RhbmNlLmNsb3NlUGFuZWwoKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNsaWNrQmFjaygpIHtcbiAgICBpZiAodGhpcy5tZW51ID09IDMpIHtcbiAgICAgIHRoaXMuY29sb3IgPSB0aGlzLmJhY2t1cENvbG9yO1xuICAgICAgdGhpcy5oc3ZhID0gdGhpcy5zZXJ2aWNlLnN0cmluZ1RvSHN2YSh0aGlzLmNvbG9yKTtcbiAgICB9XG4gICAgdGhpcy5pbmRleFNlbGVjY2lvbmFkbyA9IHRoaXMuZmluZEluZGV4U2VsZWN0ZWRDb2xvcih0aGlzLnBhbGV0dGUpO1xuICAgIHRoaXMubWVudSA9IDE7XG4gIH1cblxuICBpc091dHNpZGUoZXZlbnQpIHtcbiAgICByZXR1cm4gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbmd4LWNvbG9ycy1vdmVybGF5Jyk7XG4gIH1cbn1cbiIsIjxkaXYgY2xhc3M9XCJvcGVuZWRcIiBbc3R5bGVdPVwicG9zaXRpb25TdHJpbmdcIiBbYXR0ci5kaXJdPVwiZGlyXCIgI2RpYWxvZz5cbiAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIm1lbnUgPT0gMVwiPlxuICAgIDxkaXYgY2xhc3M9XCJjb2xvcnNcIiBbQGNvbG9yc0FuaW1hdGlvbl09XCJjb2xvcnNBbmltYXRpb25FZmZlY3RcIj5cbiAgICAgIDxuZy1jb250YWluZXIgKm5nRm9yPVwibGV0IGNvbG9yIG9mIHBhbGV0dGU7IGxldCBpID0gaW5kZXhcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZSB3cmFwcGVyIGNvbG9yXCI+XG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgKGNsaWNrKT1cIm9uQ29sb3JDbGljayhjb2xvcilcIlxuICAgICAgICAgICAgY2xhc3M9XCJjaXJjbGUgY29sb3IgY2lyY2xlLWJvcmRlclwiXG4gICAgICAgICAgICBbY2xhc3MuY29sb3JudWxsXT1cIiFjb2xvclwiXG4gICAgICAgICAgICBbbmdTdHlsZV09XCJnZXRCYWNrZ3JvdW5kQ29sb3IoY29sb3IpXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2ICpuZ0lmPVwiaSA9PSB0aGlzLmluZGV4U2VsZWNjaW9uYWRvXCIgY2xhc3M9XCJzZWxlY3RlZFwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgPGRpdlxuICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6IHJnYigyNDUgMjQ1IDI0NSk7IHBvc2l0aW9uOiByZWxhdGl2ZVwiXG4gICAgICAgIChjbGljayk9XCJhZGRDb2xvcigpXCJcbiAgICAgICAgKm5nSWY9XCIhaGlkZUNvbG9yUGlja2VyICYmIHRoaXMuY29sb3JQaWNrZXJDb250cm9scyAhPSAnb25seS1hbHBoYSdcIlxuICAgICAgICBjbGFzcz1cImNpcmNsZSBidXR0b25cIlxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgKm5nSWY9XCJ0aGlzLmluZGV4U2VsZWNjaW9uYWRvID09PSB1bmRlZmluZWRcIlxuICAgICAgICAgIHN0eWxlPVwiXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICBoZWlnaHQ6IDdweDtcbiAgICAgICAgICAgIHdpZHRoOiA3cHg7XG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDAsIDAsIDAsIDAuMDMpO1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTAwJTtcbiAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgIFwiXG4gICAgICAgICAgW25nU3R5bGVdPVwiZ2V0QmFja2dyb3VuZENvbG9yKGNvbG9yKVwiXG4gICAgICAgID48L2Rpdj5cbiAgICAgICAgPHN2Z1xuICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgIGhlaWdodD1cIjI0cHhcIlxuICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMjQgMjRcIlxuICAgICAgICAgIHdpZHRoPVwiMjRweFwiXG4gICAgICAgICAgZmlsbD1cIiMyMjIyMjJcIlxuICAgICAgICA+XG4gICAgICAgICAgPHBhdGggZD1cIk0yNCAyNEgwVjBoMjR2MjR6XCIgZmlsbD1cIm5vbmVcIiBvcGFjaXR5PVwiLjg3XCIgLz5cbiAgICAgICAgICA8cGF0aCBkPVwiTTE2LjU5IDguNTlMMTIgMTMuMTcgNy40MSA4LjU5IDYgMTBsNiA2IDYtNi0xLjQxLTEuNDF6XCIgLz5cbiAgICAgICAgPC9zdmc+XG4gICAgICAgIDwhLS0gPGRpdiBjbGFzcz1cImFkZFwiPlxuICAgICAgICAgIDxpY29ucyBpY29uPVwiYWRkXCI+PC9pY29ucz5cbiAgICAgICAgPC9kaXY+IC0tPlxuICAgICAgPC9kaXY+XG4gICAgICA8Y29sb3ItcGlja2VyXG4gICAgICAgICpuZ0lmPVwiIWhpZGVDb2xvclBpY2tlciAmJiB0aGlzLmNvbG9yUGlja2VyQ29udHJvbHMgPT0gJ29ubHktYWxwaGEnXCJcbiAgICAgICAgW2NvbnRyb2xzXT1cImNvbG9yUGlja2VyQ29udHJvbHNcIlxuICAgICAgICBbY29sb3JdPVwiaHN2YVwiXG4gICAgICAgIFtkaXJdPVwiZGlyXCJcbiAgICAgICAgKGNvbG9yQ2hhbmdlKT1cIm9uQ2hhbmdlQ29sb3JQaWNrZXIoJGV2ZW50KVwiXG4gICAgICAgIChvbkFscGhhQ2hhbmdlKT1cIm9uQWxwaGFDaGFuZ2UoJGV2ZW50KVwiXG4gICAgICA+PC9jb2xvci1waWNrZXI+XG4gICAgPC9kaXY+XG4gIDwvbmctY29udGFpbmVyPlxuICA8bmctY29udGFpbmVyICpuZ0lmPVwibWVudSA9PSAyXCI+XG4gICAgPGRpdiBjbGFzcz1cImNvbG9yc1wiIFtAY29sb3JzQW5pbWF0aW9uXT1cImNvbG9yc0FuaW1hdGlvbkVmZmVjdFwiPlxuICAgICAgPGRpdiBjbGFzcz1cImNpcmNsZSB3cmFwcGVyXCI+XG4gICAgICAgIDxkaXYgKGNsaWNrKT1cIm9uQ2xpY2tCYWNrKClcIiBjbGFzcz1cImFkZFwiPlxuICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICAgICAgd2lkdGg9XCIyNFwiXG4gICAgICAgICAgICBoZWlnaHQ9XCIyNFwiXG4gICAgICAgICAgICB2aWV3Qm94PVwiMCAwIDI0IDI0XCJcbiAgICAgICAgICAgIFtjbGFzcy5ydGwtaWNvbl09XCJkaXIgPT09ICdydGwnXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTAgMGgyNHYyNEgwelwiIGZpbGw9XCJub25lXCIgLz5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9XCJNMjAgMTFINy44M2w1LjU5LTUuNTlMMTIgNGwtOCA4IDggOCAxLjQxLTEuNDFMNy44MyAxM0gyMHYtMnpcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPG5nLWNvbnRhaW5lciAqbmdGb3I9XCJsZXQgdmFyaWFudCBvZiB2YXJpYW50c1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2lyY2xlIHdyYXBwZXIgY29sb3JcIj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBbY2xhc3MuY29sb3JudWxsXT1cIiF2YXJpYW50XCJcbiAgICAgICAgICAgIChjbGljayk9XCJjaGFuZ2VDb2xvcih2YXJpYW50KVwiXG4gICAgICAgICAgICBjbGFzcz1cImNpcmNsZSBjaXJjbGUtYm9yZGVyXCJcbiAgICAgICAgICAgIFtuZ1N0eWxlXT1cInsgYmFja2dyb3VuZDogdmFyaWFudCB9XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2ICpuZ0lmPVwiaXNTZWxlY3RlZCh2YXJpYW50KVwiIGNsYXNzPVwic2VsZWN0ZWRcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICA8L2Rpdj5cbiAgPC9uZy1jb250YWluZXI+XG4gIDxuZy1jb250YWluZXIgKm5nSWY9XCJtZW51ID09IDNcIj5cbiAgICA8ZGl2IGNsYXNzPVwibmF2LXdyYXBwZXJcIiBbY2xhc3MucnRsLW5hdl09XCJkaXIgPT09ICdydGwnXCI+XG4gICAgICA8ZGl2XG4gICAgICAgIChjbGljayk9XCJvbkNsaWNrQmFjaygpXCJcbiAgICAgICAgY2xhc3M9XCJyb3VuZC1idXR0b24gYnV0dG9uXCJcbiAgICAgICAgW2NsYXNzLnJ0bC1idXR0b25dPVwiZGlyID09PSAncnRsJ1wiXG4gICAgICA+XG4gICAgICAgIDxzdmdcbiAgICAgICAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcbiAgICAgICAgICB3aWR0aD1cIjI0XCJcbiAgICAgICAgICBoZWlnaHQ9XCIyNFwiXG4gICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgW2NsYXNzLnJ0bC1pY29uXT1cImRpciA9PT0gJ3J0bCdcIlxuICAgICAgICA+XG4gICAgICAgICAgPHBhdGggZD1cIk0wIDBoMjR2MjRIMHpcIiBmaWxsPVwibm9uZVwiIC8+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGQ9XCJNMjAgMTFINy44M2w1LjU5LTUuNTlMMTIgNGwtOCA4IDggOCAxLjQxLTEuNDFMNy44MyAxM0gyMHYtMnpcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIChjbGljayk9XCJlbWl0Q2xvc2UoJ2NhbmNlbCcpXCIgW2NsYXNzLnJ0bC1idXR0b25dPVwiZGlyID09PSAncnRsJ1wiPlxuICAgICAgICB7eyBjYW5jZWxMYWJlbCB9fVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uIChjbGljayk9XCJlbWl0Q2xvc2UoJ2FjY2VwdCcpXCIgW2NsYXNzLnJ0bC1idXR0b25dPVwiZGlyID09PSAncnRsJ1wiPlxuICAgICAgICB7eyBhY2NlcHRMYWJlbCB9fVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImNvbG9yLXBpY2tlci13cmFwcGVyXCI+XG4gICAgICA8IS0tIDxzcGFuIFsoY29sb3JQaWNrZXIpXT1cImNvbG9yXCI+PC9zcGFuPiAtLT5cbiAgICAgIDxjb2xvci1waWNrZXJcbiAgICAgICAgW2NvbnRyb2xzXT1cImNvbG9yUGlja2VyQ29udHJvbHNcIlxuICAgICAgICBbY29sb3JdPVwiaHN2YVwiXG4gICAgICAgIFtkaXJdPVwiZGlyXCJcbiAgICAgICAgKHNsaWRlckNoYW5nZSk9XCJvbkNoYW5nZUNvbG9yUGlja2VyKCRldmVudClcIlxuICAgICAgPjwvY29sb3ItcGlja2VyPlxuICAgIDwvZGl2PlxuICA8L25nLWNvbnRhaW5lcj5cbiAgPGRpdiBjbGFzcz1cIm1hbnVhbC1pbnB1dC13cmFwcGVyXCIgKm5nSWY9XCIhaGlkZVRleHRJbnB1dFwiPlxuICAgIDxwIChjbGljayk9XCJuZXh0Rm9ybWF0KClcIiBzdHlsZT1cImN1cnNvcjogcG9pbnRlcjtcIj57eyBjb2xvckZvcm1hdHNbZm9ybWF0XSB9fTwvcD5cbiAgICA8ZGl2IGNsYXNzPVwiZy1pbnB1dFwiPlxuICAgICAgPGlucHV0XG4gICAgICAgIFtwbGFjZWhvbGRlcl09XCJwbGFjZWhvbGRlclwiXG4gICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgW3ZhbHVlXT1cImNvbG9yXCJcbiAgICAgICAgW3N0eWxlLmZvbnQtc2l6ZS5weF09XCJjb2xvciAmJiBjb2xvci5sZW5ndGggPiAyMyA/IDkgOiAxMFwiXG4gICAgICAgIFtzdHlsZS5sZXR0ZXItc3BhY2luZy5weF09XCJjb2xvciAmJiBjb2xvci5sZW5ndGggPiAxNiA/IDAgOiAxLjVcIlxuICAgICAgICAoa2V5dXApPVwiY2hhbmdlQ29sb3JNYW51YWwocGFpbnRJbnB1dC52YWx1ZSlcIlxuICAgICAgICAoa2V5ZG93bi5lbnRlcik9XCJlbWl0Q2xvc2UoJ2FjY2VwdCcpXCJcbiAgICAgICAgI3BhaW50SW5wdXRcbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+XG4iXX0=