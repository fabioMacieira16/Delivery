import { Component, OnInit } from '@angular/core';
import{ FormGroup, FormBuilder, Validators, EmailValidator, AbstractControl} from '@angular/forms';
import { RadioOption } from 'app/shared/radio/radio-option.model';
import { OrderService } from './order.service';
import { CartItem } from 'app/restaurant-detail/shopping-cart/cart-item.model';
import { Order, OrderItem } from './order.model';
import { Router } from '@angular/router';

@Component({
  selector: 'mt-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {

  emailPattern =  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
  numerPattern = /^[0-9]*$/
  
  orderForm: FormGroup
  delivery: number = 8

  paymentOptions: RadioOption[] = [
    { label: 'Dinheiro', value: 'MON' },
    { label: 'Cartão de Debito', value: 'DEB' },
    { label: 'Cartão Refeição', value: 'REF' }
  ]

  constructor(private orderService: OrderService, 
              private router: Router,
              private formBilder: FormBuilder) { }

  ngOnInit() {
    //responsavel por passar tambem as validações do form
    this.orderForm = this.formBilder.group({
      name: this.formBilder.control('', [Validators.required, Validators.minLength(5)]),
      email: this.formBilder.control('', [Validators.required, Validators.pattern(this.emailPattern)]),
      emailConfirmation: this.formBilder.control('', [Validators.required, Validators.pattern(this.emailPattern)]),
      address: this.formBilder.control('', [Validators.required, Validators.minLength(5)]),
      number: this.formBilder.control('', [Validators.required, Validators.pattern(this.numerPattern)]),
      optionalAddress: this.formBilder.control(''),
      paymentOptions: this.formBilder.control('', [Validators.required])
    }, {validator: OrderComponent.equalsTo} )
  }

  static equalsTo(group: AbstractControl): {[key:string]: boolean}{
    const email = group.get('email')
    const emailConfirmation = group.get('emailConfirmation')
    if(!email || !emailConfirmation){
      return undefined
    }
    if(email.value !== emailConfirmation.value){
      return {emailsNotMatch:true}
    }
    return undefined
  }

  ItemsValues(): number {
    return this.orderService.ItemsValues()
  }

  cartItems(): CartItem[] {
    return this.orderService.cartItems()
  }

  increaseQty(item: CartItem) {
    this.orderService.increaseQty(item)
  }

  decreaseQty(item: CartItem) {
    this.orderService.DecreaseQty(item)
  }

  remove(item: CartItem){
    this.orderService.remove(item) 
  }

  checkOrder(order: Order){
    order.orderItems = this.cartItems()
      .map((item:CartItem)=> new OrderItem(item.quantity, item.menuItem.id))
    this.orderService.checkOrder(order)
      .subscribe((orderId: string) => {
        this.router.navigate(['/order-summary'])
        //console.log(`Compra Concluída: ${orderId}`)
        this.orderService.clear()
      })
    console.log(order)
  }
  
}
