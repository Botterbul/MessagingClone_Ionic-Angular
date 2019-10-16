import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFormPage } from './chat-form.page';

describe('ChatFormPage', () => {
  let component: ChatFormPage;
  let fixture: ComponentFixture<ChatFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
