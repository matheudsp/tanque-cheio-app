import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Platform, Text, StyleSheet } from "react-native";
import { AppleMaps, GoogleMaps, type Coordinates } from "expo-maps";
import { useTheme } from "@/providers/themeProvider";
import type { GasStation } from "@/types";
// Importações existentes...

export interface MapComponentRef {
  // Adiciona os deltas de latitude e longitude como parâmetros
  animateToRegion: (
    latitude: number,
    longitude: number,
    latitudeDelta: number, // Adicionado
    longitudeDelta: number // Adicionado
  ) => void;
}

interface MapComponentProps {
  userLocation: Coordinates | null;
  stations: GasStation[];
  onMarkerPress: (station: GasStation) => void;
  onMapPress: () => void;
  onRegionChangeComplete: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(
  (
    {
      userLocation,
      stations,
      onMarkerPress,
      onMapPress,
      onRegionChangeComplete,
    },
    ref
  ) => {
    const googleMapRef = useRef<any>(null);
    const appleMapRef = useRef<any>(null);
    const { themeState } = useTheme();

    useImperativeHandle(ref, () => ({
      animateToRegion: (latitude, longitude, latitudeDelta, longitudeDelta) => {
        const cameraConfig = {
          coordinates: { latitude, longitude },
          zoom: 15,
        };

        if (Platform.OS === "ios") {
          appleMapRef.current?.setCameraPosition(cameraConfig);
          // Para AppleMaps, se precisar de ajuste mais fino de região:
          // appleMapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta });
        } else {
          googleMapRef.current?.setCameraPosition({
            ...cameraConfig,
            duration: 500,
          });
          // Para GoogleMaps, pode usar animateToRegion com um LatLngBounds, mas setCameraPosition é mais simples
          // googleMapRef.current?.animateCamera({
          //   center: { latitude, longitude },
          //   zoom: 15, // Ou calcular zoom a partir dos deltas
          // });
        }
      },
    }));

    const handleMapPress = () => {
      onMapPress();
    };

    const renderMarkers = (): any[] => {
      return stations.map((station) => {
        const [lng, lat] = station.localization.coordinates?.coordinates || [
          0, 0,
        ];
        const marker = {
          id: station.id,
          coordinates: { latitude: lat, longitude: lng },
          icon: require("../assets/icons/fuels/default.png"),
        };
        return marker;
      });
    };

    const sharedProps = {
      style: styles.map,
      markers: renderMarkers(),
      cameraPosition: userLocation
        ? { coordinates: userLocation, zoom: 15 }
        : undefined,
      onMapClick: handleMapPress,
      onRegionChangeComplete: (event: any) => {
        onRegionChangeComplete({
          latitude: event.camera.center.latitude,
          longitude: event.camera.center.longitude,
          latitudeDelta: event.visibleRegion.latitudeDelta,
          longitudeDelta: event.visibleRegion.longitudeDelta,
        });
      },
      uiSettings: {
        myLocationButtonEnabled: false,
        compassEnabled: true,
        zoomControlsEnabled: false,
      },
      userLocation: userLocation
        ? { coordinates: userLocation, followUserLocation: true }
        : undefined,
      onMarkerClick: (marker: any) => {
        const station = stations.find((s) => s.id === marker.id);
        if (station) onMarkerPress(station);
      },
    };

    if (Platform.OS === "ios") {
      return <AppleMaps.View ref={appleMapRef} {...sharedProps} />;
    } else if (Platform.OS === "android") {
      return <GoogleMaps.View ref={googleMapRef} {...sharedProps} />;
    }

    return (
      <Text style={styles.unsupported}>
        Map not supported on this platform.
      </Text>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
  },
  unsupported: {
    textAlign: "center",
    marginTop: 40,
  },
});

export default MapComponent;
