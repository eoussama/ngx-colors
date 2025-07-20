import { EventEmitter, Input, Output, Directive, HostListener, forwardRef, } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { formats } from '../helpers/formats';
import { ColorFormats } from '../enums/formats';
import * as i0 from "@angular/core";
import * as i1 from "../services/panel-factory.service";
import * as i2 from "../services/converter.service";
export class NgxColorsTriggerDirective {
    onClick() {
        this.openPanel();
    }
    constructor(triggerRef, panelFactory, service) {
        this.triggerRef = triggerRef;
        this.panelFactory = panelFactory;
        this.service = service;
        //Main input/output of the color picker
        // @Input() color = '#000000';
        // @Output() colorChange:EventEmitter<string> = new EventEmitter<string>();
        this.color = '';
        //This defines the type of animation for the palatte.(slide-in | popup)
        this.colorsAnimation = 'slide-in';
        this.dir = 'ltr';
        this.position = 'bottom';
        this.attachTo = undefined;
        this.overlayClassName = undefined;
        this.colorPickerControls = 'default';
        this.acceptLabel = 'ACCEPT';
        this.cancelLabel = 'CANCEL';
        // This event is trigger every time the selected color change
        this.change = new EventEmitter();
        // This event is trigger every time the user change the color using the panel
        this.input = new EventEmitter();
        // This event is trigger every time the user change the color using the panel
        this.slider = new EventEmitter();
        this.close = new EventEmitter();
        this.open = new EventEmitter();
        this.isDisabled = false;
        this.onTouchedCallback = () => { };
        this.onChangeCallback = () => { };
    }
    ngOnDestroy() {
        if (this.panelRef) {
            this.panelFactory.removePanel();
        }
    }
    openPanel() {
        if (!this.isDisabled) {
            this.panelRef = this.panelFactory.createPanel(this.attachTo, this.overlayClassName);
            this.panelRef.instance.iniciate(this, this.triggerRef, this.color, this.palette, this.colorsAnimation, this.format, this.hideTextInput, this.hideColorPicker, this.acceptLabel, this.cancelLabel, this.colorPickerControls, this.position, this.formats, this.dir);
        }
        this.open.emit(this.color);
    }
    closePanel() {
        this.panelFactory.removePanel();
        this.onTouchedCallback();
        this.close.emit(this.color);
    }
    setDisabledState(isDisabled) {
        this.isDisabled = isDisabled;
        this.triggerRef.nativeElement.style.opacity = isDisabled ? 0.5 : 1;
    }
    setColor(color, previewColor = "") {
        this.writeValue(color, previewColor);
        this.onChangeCallback(color);
        this.input.emit(color);
    }
    sliderChange(color) {
        this.slider.emit(color);
    }
    get value() {
        return this.color;
    }
    set value(value) {
        this.setColor(value);
        this.onChangeCallback(value);
    }
    writeValue(value, previewColor = "") {
        if (value !== this.color) {
            if (this.format) {
                let format = formats.indexOf(this.format.toLowerCase());
                value = this.service.stringToFormat(value, format);
            }
            this.color = value;
            let isCmyk = false;
            if (value && value.startsWith('cmyk')) {
                isCmyk = true;
                if (!previewColor) {
                    previewColor = this.service.stringToFormat(value, ColorFormats.RGBA);
                }
            }
            this.change.emit(isCmyk ? previewColor : value);
        }
    }
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
}
NgxColorsTriggerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxColorsTriggerDirective, deps: [{ token: i0.ElementRef }, { token: i1.PanelFactoryService }, { token: i2.ConverterService }], target: i0.ɵɵFactoryTarget.Directive });
NgxColorsTriggerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.10", type: NgxColorsTriggerDirective, selector: "[ngx-colors-trigger]", inputs: { colorsAnimation: "colorsAnimation", palette: "palette", dir: "dir", format: "format", formats: "formats", position: "position", hideTextInput: "hideTextInput", hideColorPicker: "hideColorPicker", attachTo: "attachTo", overlayClassName: "overlayClassName", colorPickerControls: "colorPickerControls", acceptLabel: "acceptLabel", cancelLabel: "cancelLabel" }, outputs: { change: "change", input: "input", slider: "slider", close: "close", open: "open" }, host: { listeners: { "click": "onClick()" } }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxColorsTriggerDirective),
            multi: true,
        },
    ], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxColorsTriggerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngx-colors-trigger]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxColorsTriggerDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i1.PanelFactoryService }, { type: i2.ConverterService }]; }, propDecorators: { colorsAnimation: [{
                type: Input
            }], palette: [{
                type: Input
            }], dir: [{
                type: Input
            }], format: [{
                type: Input
            }], formats: [{
                type: Input
            }], position: [{
                type: Input
            }], hideTextInput: [{
                type: Input
            }], hideColorPicker: [{
                type: Input
            }], attachTo: [{
                type: Input
            }], overlayClassName: [{
                type: Input
            }], colorPickerControls: [{
                type: Input
            }], acceptLabel: [{
                type: Input
            }], cancelLabel: [{
                type: Input
            }], change: [{
                type: Output
            }], input: [{
                type: Output
            }], slider: [{
                type: Output
            }], close: [{
                type: Output
            }], open: [{
                type: Output
            }], onClick: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWNvbG9ycy10cmlnZ2VyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1jb2xvcnMvc3JjL2xpYi9kaXJlY3RpdmVzL25neC1jb2xvcnMtdHJpZ2dlci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFHVCxZQUFZLEVBQ1osVUFBVSxHQUVYLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7O0FBYWhELE1BQU0sT0FBTyx5QkFBeUI7SUFvQ2IsT0FBTztRQUM1QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUNELFlBQ1UsVUFBc0IsRUFDdEIsWUFBaUMsRUFDakMsT0FBeUI7UUFGekIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUN0QixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDakMsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUF2Q25DLHVDQUF1QztRQUN2Qyw4QkFBOEI7UUFDOUIsMkVBQTJFO1FBRTNFLFVBQUssR0FBRyxFQUFFLENBQUM7UUFFWCx1RUFBdUU7UUFDOUQsb0JBQWUsR0FBeUIsVUFBVSxDQUFDO1FBS25ELFFBQUcsR0FBYyxLQUFLLENBQUM7UUFHdkIsYUFBUSxHQUFxQixRQUFRLENBQUM7UUFHdEMsYUFBUSxHQUF1QixTQUFTLENBQUM7UUFDekMscUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztRQUNqRCx3QkFBbUIsR0FDMUIsU0FBUyxDQUFDO1FBQ0gsZ0JBQVcsR0FBVyxRQUFRLENBQUM7UUFDL0IsZ0JBQVcsR0FB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QUM7WUFDeEQsS0FBSyxFQUFFLElBQUk7U0FDWjtLQUNGOzRGQUVVLHlCQUF5QjtrQkFWckMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsc0JBQXNCO29CQUNoQyxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsT0FBTyxFQUFFLGlCQUFpQjs0QkFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsMEJBQTBCLENBQUM7NEJBQ3hELEtBQUssRUFBRSxJQUFJO3lCQUNaO3FCQUNGO2lCQUNGO2tLQVdVLGVBQWU7c0JBQXZCLEtBQUs7Z0JBR0csT0FBTztzQkFBZixLQUFLO2dCQUVHLEdBQUc7c0JBQVgsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csT0FBTztzQkFBZixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxlQUFlO3NCQUF2QixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUs7Z0JBQ0csZ0JBQWdCO3NCQUF4QixLQUFLO2dCQUNHLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFFRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBRUksTUFBTTtzQkFBZixNQUFNO2dCQUVHLEtBQUs7c0JBQWQsTUFBTTtnQkFFRyxNQUFNO3NCQUFmLE1BQU07Z0JBQ0csS0FBSztzQkFBZCxNQUFNO2dCQUNHLElBQUk7c0JBQWIsTUFBTTtnQkFFZ0IsT0FBTztzQkFBN0IsWUFBWTt1QkFBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT3V0cHV0LFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIENvbXBvbmVudFJlZixcbiAgSG9zdExpc3RlbmVyLFxuICBmb3J3YXJkUmVmLFxuICBPbkRlc3Ryb3ksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGFuZWxGYWN0b3J5U2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3BhbmVsLWZhY3Rvcnkuc2VydmljZSc7XG5pbXBvcnQgeyBQYW5lbENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudHMvcGFuZWwvcGFuZWwuY29tcG9uZW50JztcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE5neENvbG9yc0NvbG9yIH0gZnJvbSAnLi4vY2xhc2VzL2NvbG9yJztcbmltcG9ydCB7IENvbnZlcnRlclNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9jb252ZXJ0ZXIuc2VydmljZSc7XG5pbXBvcnQgeyBmb3JtYXRzIH0gZnJvbSAnLi4vaGVscGVycy9mb3JtYXRzJztcbmltcG9ydCB7IENvbG9yRm9ybWF0cyB9IGZyb20gJy4uL2VudW1zL2Zvcm1hdHMnO1xuaW1wb3J0IHsgRGlyZWN0aW9uIH0gZnJvbSAnLi4vdHlwZXMvZGlyZWN0aW9uJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW25neC1jb2xvcnMtdHJpZ2dlcl0nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5neENvbG9yc1RyaWdnZXJEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTmd4Q29sb3JzVHJpZ2dlckRpcmVjdGl2ZVxuICBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBPbkRlc3Ryb3lcbntcbiAgLy9NYWluIGlucHV0L291dHB1dCBvZiB0aGUgY29sb3IgcGlja2VyXG4gIC8vIEBJbnB1dCgpIGNvbG9yID0gJyMwMDAwMDAnO1xuICAvLyBAT3V0cHV0KCkgY29sb3JDaGFuZ2U6RXZlbnRFbWl0dGVyPHN0cmluZz4gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcblxuICBjb2xvciA9ICcnO1xuXG4gIC8vVGhpcyBkZWZpbmVzIHRoZSB0eXBlIG9mIGFuaW1hdGlvbiBmb3IgdGhlIHBhbGF0dGUuKHNsaWRlLWluIHwgcG9wdXApXG4gIEBJbnB1dCgpIGNvbG9yc0FuaW1hdGlvbjogJ3NsaWRlLWluJyB8ICdwb3B1cCcgPSAnc2xpZGUtaW4nO1xuXG4gIC8vVGhpcyBpcyB1c2VkIHRvIHNldCBhIGN1c3RvbSBwYWxldHRlIG9mIGNvbG9ycyBpbiB0aGUgcGFuZWw7XG4gIEBJbnB1dCgpIHBhbGV0dGU6IEFycmF5PHN0cmluZz4gfCBBcnJheTxOZ3hDb2xvcnNDb2xvcj47XG5cbiAgQElucHV0KCkgZGlyOiBEaXJlY3Rpb24gPSAnbHRyJztcbiAgQElucHV0KCkgZm9ybWF0OiBzdHJpbmc7XG4gIEBJbnB1dCgpIGZvcm1hdHM6IHN0cmluZ1tdO1xuICBASW5wdXQoKSBwb3NpdGlvbjogJ3RvcCcgfCAnYm90dG9tJyA9ICdib3R0b20nO1xuICBASW5wdXQoKSBoaWRlVGV4dElucHV0OiBib29sZWFuO1xuICBASW5wdXQoKSBoaWRlQ29sb3JQaWNrZXI6IGJvb2xlYW47XG4gIEBJbnB1dCgpIGF0dGFjaFRvOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIEBJbnB1dCgpIG92ZXJsYXlDbGFzc05hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgQElucHV0KCkgY29sb3JQaWNrZXJDb250cm9sczogJ2RlZmF1bHQnIHwgJ29ubHktYWxwaGEnIHwgJ25vLWFscGhhJyA9XG4gICAgJ2RlZmF1bHQnO1xuICBASW5wdXQoKSBhY2NlcHRMYWJlbDogc3RyaW5nID0gJ0FDQ0VQVCc7XG4gIEBJbnB1dCgpIGNhbmNlbExhYmVsOiBzdHJpbmcgPSAnQ0FOQ0VMJztcbiAgLy8gVGhpcyBldmVudCBpcyB0cmlnZ2VyIGV2ZXJ5IHRpbWUgdGhlIHNlbGVjdGVkIGNvbG9yIGNoYW5nZVxuICBAT3V0cHV0KCkgY2hhbmdlOiBFdmVudEVtaXR0ZXI8c3RyaW5nPiA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICAvLyBUaGlzIGV2ZW50IGlzIHRyaWdnZXIgZXZlcnkgdGltZSB0aGUgdXNlciBjaGFuZ2UgdGhlIGNvbG9yIHVzaW5nIHRoZSBwYW5lbFxuICBAT3V0cHV0KCkgaW5wdXQ6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gIC8vIFRoaXMgZXZlbnQgaXMgdHJpZ2dlciBldmVyeSB0aW1lIHRoZSB1c2VyIGNoYW5nZSB0aGUgY29sb3IgdXNpbmcgdGhlIHBhbmVsXG4gIEBPdXRwdXQoKSBzbGlkZXI6IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG4gIEBPdXRwdXQoKSBjbG9zZTogRXZlbnRFbWl0dGVyPHN0cmluZz4gPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcbiAgQE91dHB1dCgpIG9wZW46IEV2ZW50RW1pdHRlcjxzdHJpbmc+ID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKSBvbkNsaWNrKCkge1xuICAgIHRoaXMub3BlblBhbmVsKCk7XG4gIH1cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSB0cmlnZ2VyUmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgcGFuZWxGYWN0b3J5OiBQYW5lbEZhY3RvcnlTZXJ2aWNlLFxuICAgIHByaXZhdGUgc2VydmljZTogQ29udmVydGVyU2VydmljZVxuICApIHt9XG5cbiAgcGFuZWxSZWY6IENvbXBvbmVudFJlZjxQYW5lbENvbXBvbmVudD47XG4gIGlzRGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBvblRvdWNoZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9ICgpID0+IHt9O1xuICBvbkNoYW5nZUNhbGxiYWNrOiAoXzogYW55KSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnBhbmVsUmVmKSB7XG4gICAgICB0aGlzLnBhbmVsRmFjdG9yeS5yZW1vdmVQYW5lbCgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvcGVuUGFuZWwoKSB7XG4gICAgaWYgKCF0aGlzLmlzRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMucGFuZWxSZWYgPSB0aGlzLnBhbmVsRmFjdG9yeS5jcmVhdGVQYW5lbChcbiAgICAgICAgdGhpcy5hdHRhY2hUbyxcbiAgICAgICAgdGhpcy5vdmVybGF5Q2xhc3NOYW1lXG4gICAgICApO1xuICAgICAgdGhpcy5wYW5lbFJlZi5pbnN0YW5jZS5pbmljaWF0ZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgdGhpcy50cmlnZ2VyUmVmLFxuICAgICAgICB0aGlzLmNvbG9yLFxuICAgICAgICB0aGlzLnBhbGV0dGUsXG4gICAgICAgIHRoaXMuY29sb3JzQW5pbWF0aW9uLFxuICAgICAgICB0aGlzLmZvcm1hdCxcbiAgICAgICAgdGhpcy5oaWRlVGV4dElucHV0LFxuICAgICAgICB0aGlzLmhpZGVDb2xvclBpY2tlcixcbiAgICAgICAgdGhpcy5hY2NlcHRMYWJlbCxcbiAgICAgICAgdGhpcy5jYW5jZWxMYWJlbCxcbiAgICAgICAgdGhpcy5jb2xvclBpY2tlckNvbnRyb2xzLFxuICAgICAgICB0aGlzLnBvc2l0aW9uLFxuICAgICAgICB0aGlzLmZvcm1hdHMsXG4gICAgICAgIHRoaXMuZGlyXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLm9wZW4uZW1pdCh0aGlzLmNvbG9yKTtcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZVBhbmVsKCkge1xuICAgIHRoaXMucGFuZWxGYWN0b3J5LnJlbW92ZVBhbmVsKCk7XG4gICAgdGhpcy5vblRvdWNoZWRDYWxsYmFjaygpO1xuICAgIHRoaXMuY2xvc2UuZW1pdCh0aGlzLmNvbG9yKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmlzRGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICAgIHRoaXMudHJpZ2dlclJlZi5uYXRpdmVFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBpc0Rpc2FibGVkID8gMC41IDogMTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRDb2xvcihjb2xvciwgcHJldmlld0NvbG9yID0gXCJcIikge1xuICAgIHRoaXMud3JpdGVWYWx1ZShjb2xvciwgcHJldmlld0NvbG9yKTtcbiAgICB0aGlzLm9uQ2hhbmdlQ2FsbGJhY2soY29sb3IpO1xuICAgIHRoaXMuaW5wdXQuZW1pdChjb2xvcik7XG4gIH1cblxuICBwdWJsaWMgc2xpZGVyQ2hhbmdlKGNvbG9yKSB7XG4gICAgdGhpcy5zbGlkZXIuZW1pdChjb2xvcik7XG4gIH1cblxuICBnZXQgdmFsdWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5jb2xvcjtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zZXRDb2xvcih2YWx1ZSk7XG4gICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHZhbHVlKTtcbiAgfVxuXG4gIHdyaXRlVmFsdWUodmFsdWUsIHByZXZpZXdDb2xvciA9IFwiXCIpIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuY29sb3IpIHtcbiAgICAgIGlmICh0aGlzLmZvcm1hdCkge1xuICAgICAgICBsZXQgZm9ybWF0ID0gZm9ybWF0cy5pbmRleE9mKHRoaXMuZm9ybWF0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB2YWx1ZSA9IHRoaXMuc2VydmljZS5zdHJpbmdUb0Zvcm1hdCh2YWx1ZSwgZm9ybWF0KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29sb3IgPSB2YWx1ZTtcblxuICAgICAgbGV0IGlzQ215ayA9IGZhbHNlO1xuICAgICAgaWYoIHZhbHVlICYmIHZhbHVlLnN0YXJ0c1dpdGgoJ2NteWsnKSkge1xuICAgICAgICBpc0NteWsgPSB0cnVlO1xuICAgICAgICBpZiggIXByZXZpZXdDb2xvciApIHtcbiAgICAgICAgICBwcmV2aWV3Q29sb3IgPSB0aGlzLnNlcnZpY2Uuc3RyaW5nVG9Gb3JtYXQodmFsdWUsIENvbG9yRm9ybWF0cy5SR0JBKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNoYW5nZS5lbWl0KCBpc0NteWsgPyBwcmV2aWV3Q29sb3IgOiB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogYW55KSB7XG4gICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KSB7XG4gICAgdGhpcy5vblRvdWNoZWRDYWxsYmFjayA9IGZuO1xuICB9XG59XG4iXX0=