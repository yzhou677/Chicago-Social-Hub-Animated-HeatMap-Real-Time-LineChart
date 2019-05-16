////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


/// This file and the source code provided can be used only for   
/// the projects and assignments of this course

/// Last Edit by Dr. Atef Bader: 1/30/2019


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////



import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { PlacesService } from '../../places.service';
import {enableProdMode} from '@angular/core';

enableProdMode();

@Component({
  selector: 'app-find',
  templateUrl: './find.component.html',
  styleUrls: ['./find.component.css']
})
export class FindComponent implements OnInit {

  createForm: FormGroup;
  hintColor;


  constructor(private placesService: PlacesService, private fb: FormBuilder, private router: Router) {
    this.hintColor = "#76FF03";
    this.createForm = this.fb.group({
      where: '',
      find: '',
      zipcode: ''
    });
  }

  /*
  findPlaces(find, where, zipcode) {
     
    this.placesService.findPlaces(find, where).subscribe(() => {

      this.router.navigate(['/list_of_places']);

    });
  **/
  findPlaces(find, where) {
     
    this.placesService.findPlaces(find, where).subscribe(() => {

      this.router.navigate(['/list_of_places']);});


  }


  ngOnInit() {
  }

}
