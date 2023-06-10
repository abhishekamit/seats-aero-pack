import * as coda from "@codahq/packs-sdk";

export const pack = coda.newPack();

pack.addNetworkDomain('seats.aero');

const routeSchema = coda.makeObjectSchema({
  idProperty: 'id',
  displayProperty: 'id',
  featuredProperties: ['originAirport', 'destinationAirport', 'distance', 'numDaysOut'],
  properties: {
    id: { type: coda.ValueType.String, fromKey: 'ID' },
    originAirport: { type: coda.ValueType.String, fromKey: 'OriginAirport' },
    originRegion: { type: coda.ValueType.String, fromKey: 'OriginRegion' },
    destinationAirport: { type: coda.ValueType.String, fromKey: 'DestinationAirport' },
    destinationRegion: { type: coda.ValueType.String, fromKey: 'DestinationRegion' },
    numDaysOut: { type: coda.ValueType.Number, fromKey: 'NumDaysOut' },
    distance: { type: coda.ValueType.Number, fromKey: 'Distance' },
    source: { type: coda.ValueType.String, fromKey: 'Source' },
    autoCreated: { type: coda.ValueType.Boolean, fromKey: 'AutoCreated' },
  },
});

pack.addSyncTable({
  name: 'Routes',
  identityName: 'Route',
  schema: routeSchema,
  formula: {
    name: 'Routes',
    description: 'Routes',
    parameters: [
    ],
    execute: async function (_, context) {
      const resp = await context.fetcher.fetch({ url: 'https://seats.aero/api/routes', method: 'GET' });
      return { result: resp.body };
    },
  },
});

pack.addSyncTable({
  name: 'Availability',
  identityName: 'Availability',
  schema: coda.makeObjectSchema({
    idProperty: 'id',
    displayProperty: 'id',
    featuredProperties: ['route', 'date', 'yAvailable', 'wAvailable', 'jAvailable', 'fAvailable', 'yMileageCost', 'wMileageCost', 'jMileageCost', 'fMileageCost'],
    properties: {
      id: { type: coda.ValueType.String, fromKey: 'ID' },
      routeID: { type: coda.ValueType.String, fromKey: 'RouteID' },
      route: { ...routeSchema, fromKey: 'Route' },
      date: { type: coda.ValueType.String, fromKey: 'Date', codaType: coda.ValueHintType.Date },
      yAvailable: { type: coda.ValueType.Boolean, fromKey: 'YAvailable' },
      wAvailable: { type: coda.ValueType.Boolean, fromKey: 'WAvailable' },
      jAvailable: { type: coda.ValueType.Boolean, fromKey: 'JAvailable' },
      fAvailable: { type: coda.ValueType.Boolean, fromKey: 'FAvailable' },
      yMileageCost: { type: coda.ValueType.Number, fromKey: 'YMileageCost' },
      wMileageCost: { type: coda.ValueType.Number, fromKey: 'WMileageCost' },
      jMileageCost: { type: coda.ValueType.Number, fromKey: 'JMileageCost' },
      fMileageCost: { type: coda.ValueType.Number, fromKey: 'FMileageCost' },
      yRemainingSeats: { type: coda.ValueType.Number, fromKey: 'YRemainingSeats' },
      wRemainingSeats: { type: coda.ValueType.Number, fromKey: 'WRemainingSeats' },
      jRemainingSeats: { type: coda.ValueType.Number, fromKey: 'JRemainingSeats' },
      fRemainingSeats: { type: coda.ValueType.Number, fromKey: 'FRemainingSeats' },
      yAirlines: { type: coda.ValueType.String, fromKey: 'YAirlines' },
      wAirlines: { type: coda.ValueType.String, fromKey: 'WAirlines' },
      jAirlines: { type: coda.ValueType.String, fromKey: 'JAirlines' },
      fAirlines: { type: coda.ValueType.String, fromKey: 'FAirlines' },
      yDirect: { type: coda.ValueType.Boolean, fromKey: 'YDirect' },
      wDirect: { type: coda.ValueType.Boolean, fromKey: 'WDirect' },
      jDirect: { type: coda.ValueType.Boolean, fromKey: 'JDirect' },
      fDirect: { type: coda.ValueType.Boolean, fromKey: 'FDirect' },
      source: { type: coda.ValueType.String, fromKey: 'Source' },
      computedLastSeen: { type: coda.ValueType.String, fromKey: 'ComputedLastSeen' },
      apiTermsOfUse: { type: coda.ValueType.String, fromKey: 'APITermsOfUse' },
    },
  }),
  formula: {
    name: 'Availability',
    description: 'Availability',
    parameters: [
      coda.makeParameter({
        type: coda.ParameterType.String,
        name: 'source',
        description: 'What mileage program you are requesting availability for',
        autocomplete: ['avianca', 'american', 'aeromexico', 'delta', 'ethiad', 'united', 'virginatlantic'],
      }),
      coda.makeParameter({
        type: coda.ParameterType.DateArray,
        name: 'dates',
        description: 'What dates you are requesting availability for',
        optional: true,
      }),
    ],
    execute: async function ([source, dates], context) {
      const resp = await context.fetcher.fetch({ url: coda.withQueryParams('https://seats.aero/api/availability', { source }), method: 'GET' });
      return {
        result: resp.body.filter(route => {
          if (dates) {
            const parsedDate = new Date(route.ParsedDate);
            return parsedDate >= dates[0] && parsedDate <= dates[1];
          }
          return true;
        }).map(route => (
          {
            ...route,
            YMileageCost: Number(route.YMileageCost) || undefined,
            WMileageCost: Number(route.WMileageCost) || undefined,
            JMileageCost: Number(route.JMileageCost) || undefined,
            FMileageCost: Number(route.FMileageCost) || undefined,
          }
        ))
      };
    },
  },
});
