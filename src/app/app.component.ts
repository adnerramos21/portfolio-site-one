import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import { showHide, slideUpDown, scaleUpDown } from './app.component.animation';
import { CommonModule } from '@angular/common';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faMagnifyingGlass,
  faBars,
  faCartShopping,
  faArrowLeft,
  faAngleUp,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FontAwesomeModule],
  animations: [scaleUpDown, showHide, slideUpDown],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('contentWrapper', { static: false })
  contentWrapper?: ElementRef<HTMLDivElement>;

  @ViewChild('slideshowContainer', { static: false })
  slideshowContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren('slide') slides!: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('pickerElement') pickerElements!: QueryList<
    ElementRef<HTMLElement>
  >;

  isVisible: boolean = true;
  slideIndex: number = 1; // run first slide
  targetObjCopy: object = {};
  colors: string[] = [
    'rgba(223, 85, 37, .75)',
    'rgba(225, 178, 119, .80)',
    'rgba(142, 95, 71, .85)',
  ];
  selectedColor: number = 1;
  mySlides: HTMLElement[] = [];

  constructor(private renderer: Renderer2, library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(
      faMagnifyingGlass,
      faBars,
      faCartShopping,
      faArrowLeft,
      faAngleUp,
      faAngleDown
    );
  }

  ngAfterViewInit(): void {
    console.clear();

    if (this.slides && this.slides.length > 0) {
      this.mySlides = this.slides.map((val) => val.nativeElement);
      this.currentSlide(this.slideIndex);
    }
  }

  showSlides(n: number): void {
    // Tried:
    // getBoundingClientRect, ResizeObserver, and requestAnimationFrame
    // ResizeObserver can be a better choice, but
    // getBoundingClientRect() is not calculating the right height 508px
    // reason why we use getComputedStyle

    const currentSlide = this.mySlides[this.slideIndex - 1];
    const slideHeight = +window
      .getComputedStyle(currentSlide, null)
      .getPropertyValue('height')
      .slice(0, -2); // slice off the "px" text and extract only the number value

    this.setAndTranslateHeight(slideHeight);
  }

  setAndTranslateHeight(slideHeight: number): void {
    const slideContainer = this.slideshowContainer.nativeElement;
    const offsetY = -(slideHeight * (this.slideIndex - 1));

    this.renderer.setStyle(
      slideContainer,
      'transform',
      `translate3d(0px, ${offsetY}px, 0px)`
    );

    this.changeBackgroundColor();
  }

  changeBackgroundColor(): void {
    if (this.contentWrapper) {
      const contentWrapper = this.contentWrapper.nativeElement;

      gsap.to(contentWrapper, {
        duration: 1.5,
        backgroundColor: this.colors[this.slideIndex - 1],
      });
    }
  }

  goBack(): void {
    this.setVisibility();
    this.showAllColorElements();
  }

  shopNow(): void {
    this.setVisibility();
    this.hideUnselectedColorElements();
  }

  setVisibility(): void {
    this.isVisible = !this.isVisible;
  }

  showAllColorElements(): void {
    const colorPickerElements = this.pickerElements.map(
      (val) => val.nativeElement
    );

    for (let index = 0; index < colorPickerElements.length; index++) {
      if (colorPickerElements[index].classList.contains('disappear')) {
        colorPickerElements[index].classList.remove('disappear');
      }
    }

    this.moveObjectToTargetPosition(this.targetObjCopy, 0);
  }

  hideUnselectedColorElements(): void {
    const colorPickerElements = this.pickerElements.map(
      (val) => val.nativeElement
    );

    let accumulator = 0,
      calculatedTargetDistance = 0,
      targetObj: object = {},
      currentElementWidth = 0;

    for (let index = 0; index < colorPickerElements.length; index++) {
      currentElementWidth = +window
        .getComputedStyle(colorPickerElements[index])
        .width.slice(0, -2);
      accumulator += currentElementWidth;

      if (colorPickerElements[index].classList.contains('active')) {
        calculatedTargetDistance = accumulator - currentElementWidth;
        targetObj = colorPickerElements[index];
      } else {
        colorPickerElements[index].classList.add('disappear');
      }
    }

    this.targetObjCopy = targetObj;
    this.moveObjectToTargetPosition(targetObj, calculatedTargetDistance);
  }

  moveObjectToTargetPosition(
    targetObj: object,
    calculatedTargetDistance: number
  ): void {
    gsap.to(targetObj, {
      duration: 1,
      transform: `translate3d(-${calculatedTargetDistance}px, 0px, 0px)`,
    });
  }

  slideUp(n: number): void {
    const nextUp = (this.slideIndex += n);
    this.currentSlide(nextUp);
  }

  slideDown(n: number): void {
    const nextDown = (this.slideIndex -= n);
    this.currentSlide(nextDown);
  }

  currentSlide(n: number): void {
    this.slideIndex = n;

    if (n > this.mySlides.length) {
      this.slideIndex = 1;
    }

    if (n < 1) {
      this.slideIndex = this.mySlides.length;
    }

    this.selectedColor = this.slideIndex;
    this.showSlides(this.selectedColor);
  }
}
