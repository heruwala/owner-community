import { NodeEventBus } from '../events/node-event-bus';
import { PropertyListingIndexDocument, propertyListingIndexSpec } from './property-search-index-format';
import { CognitiveSearch } from '../../../infrastructure/services/cognitive-search';
import { PropertyUnitOfWork } from '../persistance/repositories';
import { SystemExecutionContext } from '../persistance/execution-context';
import { PropertyUpdatedEvent } from '../../events/property-updated';

export default () => {
  NodeEventBus.register(PropertyUpdatedEvent, async (payload) => {
    console.log(`Property Updated - Search Index Integration: ${JSON.stringify(payload)} and PropertyId: ${payload.id}`);

    const context = await SystemExecutionContext();
    await PropertyUnitOfWork.withTransaction(context, async (repo) => {
      let property = await repo.getById(payload.id);

      const updatedAdditionalAmenities = property.listingDetail?.additionalAmenities?.map((additionalAmenity) => {
        return { category: additionalAmenity.category, amenities: additionalAmenity.amenities };
      });

      let listingDoc: Partial<PropertyListingIndexDocument> = {
        id: property.id,
        communityId: property.community.id,
        name: property.propertyName,
        type: property.propertyType,
        bedrooms: property.listingDetail?.bedrooms,
        amenities: property.listingDetail?.amenities,
        additionalAmenities: updatedAdditionalAmenities,
        price: property.listingDetail?.price,
        bathrooms: property.listingDetail?.bathrooms,
        squareFeet: property.listingDetail?.squareFeet,
        coordinates: property.location?.position?.coordinates,
        images: property.listingDetail?.images,
        listingAgentCompany: property.listingDetail?.listingAgentCompany,
        address: {
          streetNumber: property.location?.address?.streetNumber,
          streetName: property.location?.address?.streetName,
          municipality: property.location?.address?.municipality,
          municipalitySubdivision: property.location?.address?.municipalitySubdivision,
          countrySecondarySubdivision: property.location?.address?.countrySecondarySubdivision,
          countryTertiarySubdivision: property.location?.address?.countryTertiarySubdivision,
          countrySubdivision: property.location?.address?.countrySubdivision,
          countrySubdivisionName: property.location?.address?.countrySubdivisionName,
          postalCode: property.location?.address?.postalCode,
          extendedPostalCode: property.location?.address?.extendedPostalCode,
          countryCode: property.location?.address?.countryCode,
          country: property.location?.address?.country,
          countryCodeISO3: property.location?.address?.countryCodeISO3,
          freeformAddress: property.location?.address?.freeformAddress,
        },
      };
      let cognitiveSearch = new CognitiveSearch();
      await cognitiveSearch.createOrUpdateIndex(propertyListingIndexSpec.name, propertyListingIndexSpec);
      await cognitiveSearch.indexDocument(propertyListingIndexSpec.name, listingDoc);
      console.log(`Property Updated - Search Completed: ${JSON.stringify(listingDoc)}`);
    });
  });
};
