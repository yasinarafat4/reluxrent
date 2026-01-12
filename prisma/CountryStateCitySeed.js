// CountryStateCitySeed.js;
import { getCitiesOfState, getCountries, getStatesOfCountry } from '@countrystatecity/countries';

export async function CountryStateCitySeed(prisma) {
  console.log('🌍 Starting Country, State & City seed...');

  // Seed Countries
  const countries = await getCountries();
  const countryData = countries.map((country) => ({
    name: country.name,
    iso3: country.iso3,
    iso2: country.iso2,
    phonecode: country.phonecode,
    currency: country.currency,
    currency_name: country.currency_name,
    currency_symbol: country.currency_symbol,
    latitude: country.latitude ? parseFloat(country.latitude) : null,
    longitude: country.longitude ? parseFloat(country.longitude) : null,
  }));

  await prisma.country.createMany({ data: countryData, skipDuplicates: true });
  console.log(`✅ Inserted ${countries.length} countries.`);

  const countryMap = new Map((await prisma.country.findMany()).map((c) => [c.iso2, c.id]));

  // Seed States
  console.log('🏙️ Seeding states...');
  const stateData = [];

  for (const country of countries) {
    const states = await getStatesOfCountry(country.iso2);
    for (const state of states) {
      const countryId = countryMap.get(country.iso2);
      if (countryId) {
        stateData.push({
          name: state.name,
          latitude: state.latitude ? parseFloat(state.latitude) : null,
          longitude: state.longitude ? parseFloat(state.longitude) : null,
          countryId,
        });
      }
    }
  }

  await prisma.state.createMany({ data: stateData, skipDuplicates: true });
  console.log(`✅ Inserted ${stateData.length} states.`);

  const dbStates = await prisma.state.findMany();
  const stateMap = new Map(dbStates.map((s) => [`${s.name.toLowerCase()}-${s.countryId}`, s.id]));

  // Seed Cities
  console.log('🌆 Seeding cities...');
  const cityData = [];

  for (const country of countries) {
    const states = await getStatesOfCountry(country.iso2);

    for (const state of states) {
      const countryId = countryMap.get(country.iso2);
      const stateId = stateMap.get(`${state.name.toLowerCase()}-${countryId}`);
      if (!stateId) continue;

      const cities = await getCitiesOfState(country.iso2, state.iso2 || state.id);
      if (!cities || !cities.length) continue;

      for (const city of cities) {
        cityData.push({
          name: city.name,
          latitude: city.latitude ? parseFloat(city.latitude) : 0,
          longitude: city.longitude ? parseFloat(city.longitude) : 0,
          stateId,
          countryId,
        });
      }
    }
  }

  if (cityData.length) {
    await prisma.city.createMany({ data: cityData, skipDuplicates: true });
    console.log(`✅ Inserted ${cityData.length} cities.`);
  } else {
    console.log('⚠️ No cities found (some countries may not have data).');
  }

  console.log('🎉 Seeding complete: Countries, States, and Cities.');
}
