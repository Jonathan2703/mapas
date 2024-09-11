import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import * as L from 'leaflet';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    SharedModule,
    FormsModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  private map: any;
  private marker: any;
  private circle: any;  // No se debe inicializar hasta el navegador
  private marcador: number = 0;
  public objetoIpt = {
    latitud: 0,
    longitud: 0,
    radio: 100 // Radio predeterminado
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    // Verifica si está en el entorno del navegador
    if (isPlatformBrowser(this.platformId)) {
      // Carga dinámica de Leaflet solo en el navegador
      import('leaflet').then(L => {
        this.initializeMap(L);
      }).catch(err => {
        console.error('Error al cargar Leaflet:', err);
      });
    }
  }

  private initializeMap(L: any): void {
    // Crea el mapa y establece la vista inicial
    this.map = L.map('map').setView([-2.90198, -79.01116], 20);

    // Añade la capa de OpenStreetMap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Evento de clic para agregar marcador en el mapa
    this.map.on('click', (e: { latlng: { lat: number; lng: number }; }) => {
      if (this.marcador === 0) {
        this.marker = L.marker(e.latlng, { draggable: true }).addTo(this.map);
        this.marcador = 1;
        this.objetoIpt.latitud = e.latlng.lat;
        this.objetoIpt.longitud = e.latlng.lng;
        this.drawCircle(L); // Dibuja el círculo cuando se agrega el marcador

        this.marker.on('dragend', () => {
          const position = this.marker.getLatLng();
          this.objetoIpt.latitud = position.lat;
          this.objetoIpt.longitud = position.lng;
          this.updateCircle(L);
        });
      }
    });
  }

  // initializeMapConDatos(latitud, longitud, radio) {
  //   this.map = L.map('map').setView([latitud , longitud], 20);
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //       attribution: '© OpenStreetMap contributors'
  //   }).addTo(this.map); 
  //   this.marker = L.marker([latitud, longitud], {draggable:true}).addTo(this.map);
  //   this.circle = L.circle([latitud, longitud], {
  //       color: 'blue',
  //       fillOpacity: 0.5,
  //       radius: radio
  //   }).addTo(this.map);
  //   this.marker.on('dragend', (event) => {
  //     var position = this.marker.getLatLng();
  //     this.objetoIpt.latitud = position.lat;
  //     this.objetoIpt.longitud = position.lng;
  //     this.updateCircle();
  //   });              
  // }


  // Método para dibujar el círculo
  private drawCircle(L: any): void {
    const latitud = this.objetoIpt.latitud || 0;
    const longitud = this.objetoIpt.longitud || 0;
    const radio = this.objetoIpt.radio || 100;

    if (this.circle) {
      this.map.removeLayer(this.circle);
    }

    this.circle = L.circle([latitud, longitud], {
      color: 'blue',
      fillOpacity: 0.5,
      radius: radio
    }).addTo(this.map);
  }

  // Actualiza el círculo cuando cambian las coordenadas o el radio
  private updateCircle(L: any): void {
    if (this.circle) {
      this.map.removeLayer(this.circle);
    }
    this.drawCircle(L);
  }

  // Método para manejar el cambio del radio
  handleRadioChange(event: any): void {
    this.objetoIpt.radio = event.value;
    if (this.map) {
      import('leaflet').then(L => {
        this.updateCircle(L);
      });
    }
  }
  
}
