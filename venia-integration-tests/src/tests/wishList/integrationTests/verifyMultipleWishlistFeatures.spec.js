import {
    accountAccess as accountAccessFixtures,
    homePage as homePageFixtures,
    wishlist as wishlistFixtures,
    categoryPage as categoryPageFixtures,
    productPage as productPageFixtures,
    graphqlMockedCalls as graphqlMockedCallsFixtures
} from '../../../fixtures';
import {
    myAccountMenu as myAccountMenuAssertions,
    wishlist as wishlistAssertions,
    categoryPage as categoryPageAssertions,
    productPage as productPageAssertions
} from '../../../assertions';
import {
    wishlistPage as wishlistPageActions,
    categoryPage as categoryPageActions,
    productPage as productPageActions
} from '../../../actions';
const {
    firstName,
    lastName,
    accountEmail,
    accountPassword
} = accountAccessFixtures;
const { homePage } = homePageFixtures;
const { assertCreateAccount } = myAccountMenuAssertions;
const { wishistRoute } = wishlistFixtures;
const { createWishlist } = wishlistPageActions;
const {
    assertEmptyWishlistPage,
    assertEmptyWishlistExists,
    assertCreateWishlistLink,
    assertProductInWishlist
} = wishlistAssertions;
const { categoryTops, productCarinaCardigan } = categoryPageFixtures;
const {
    addProductToWishlistFromCategoryPage,
    createWishlistViaDialog
} = categoryPageActions;
const { assertWishlistSelectedProductOnCategoryPage } = categoryPageAssertions;
const {
    productAugustaEarningsUrl,
    productAugustaEarningsName
} = productPageFixtures;
const {
    addProductToWishlistFromProductPage,
    addProductToExistingWishlistFromDialog
} = productPageActions;
const { assertProductSelectIndicator } = productPageAssertions;
const {
    getCustomerWishlistCall,
    getMultipleWishlistConfigCall,
    getWishlistDialogDataCall,
    getWishlistitemsForLocalFieldsCall,
    hitGraphqlPath,
    getWishlistConfigForGalleryCall,
    getWishlistConfigForProductPageCall
} = graphqlMockedCallsFixtures;

// TODO add tags CE, EE to test to filter and run tests as needed
describe('verify single wishlist basic features', () => {
    it('user should be able to add and remove products from wishlist', () => {
        cy.visitPage(homePage);

        cy.openLoginDialog();
        cy.createAccount(
            accountAccessFixtures.firstName,
            lastName,
            accountEmail,
            accountPassword
        );

        assertCreateAccount(firstName);

        cy.intercept('GET', getCustomerWishlistCall, {
            fixture: 'wishlist/multipleWishlist/noWishlistPage.json'
        }).as('getCustomerWishlist');
        cy.intercept('GET', getMultipleWishlistConfigCall, {
            fixture: 'wishlist/multipleWishlist/multipleWishlistEnabled.json'
        }).as('getWishlistConfig');
        cy.visitPage(wishistRoute);
        cy.wait(['@getCustomerWishlist']).its('response.body');
        cy.wait(['@getWishlistConfig']).its('response.body');

        assertEmptyWishlistPage();
        assertCreateWishlistLink();

        cy.intercept('POST', hitGraphqlPath, req => {
            if (req.body.operationName.includes('createWishlist')) {
                req.reply({
                    fixture:
                        'wishlist/multipleWishlist/wishlistPageCreateWishlist1.json'
                });
            }
        }).as('createWishlist1');
        cy.intercept('GET', getCustomerWishlistCall, {
            fixture: 'wishlist/multipleWishlist/oneWishlistNoProductsPage.json'
        }).as('getCustomerWishlist1');
        createWishlist('Test List1');
        cy.wait(['@getCustomerWishlist1']).its('response.body');
        cy.wait('@createWishlist1').should(result => {
            expect(result.request.body.variables).to.eql({
                input: { name: 'Test List1', visibility: 'PRIVATE' }
            });
            expect(result.response.body).to.exist;
        });

        assertEmptyWishlistExists('Test List1');
        assertCreateWishlistLink();

        cy.intercept('GET', getWishlistitemsForLocalFieldsCall, {
            fixture:
                'wishlist/multipleWishlist/categoryPageGetWishListDataForLocalFields.json'
        }).as('getWishlistLocalFields');
        cy.intercept('GET', getWishlistConfigForGalleryCall, {
            fixture:
                'wishlist/multipleWishlist/categoryPageGetWishlistConfigForGallery.json'
        }).as('getGalleryWishlist');
        cy.intercept('GET', getWishlistDialogDataCall, {
            fixture:
                'wishlist/multipleWishlist/categoryPageGetWishlistDialogData.json'
        }).as('getCustomerWishlist2');

        cy.visitPage(categoryTops);
        cy.wait(['@getWishlistLocalFields']).its('response.body');
        cy.wait(['@getCustomerWishlist2']).its('response.body');

        addProductToWishlistFromCategoryPage(productCarinaCardigan);

        cy.intercept('POST', hitGraphqlPath, req => {
            if (req.body.operationName.includes('createWishlist')) {
                req.reply({
                    fixture:
                        'wishlist/multipleWishlist/categoryPageCreateWishlist2.json'
                });
            }
        }).as('createWishlist2');
        cy.intercept('POST', hitGraphqlPath, req => {
            if (req.body.operationName.includes('addProductToWishlist')) {
                req.reply({
                    fixture:
                        'wishlist/multipleWishlist/categoryPageAddProductToWishlist.json'
                });
            }
        }).as('addProductToWishlist');
        cy.intercept('GET', getWishlistDialogDataCall, {
            fixture:
                'wishlist/multipleWishlist/categoryPageGetWishlistDialogDataUpdated.json'
        }).as('getCustomerWishlist3');
        cy.intercept('GET', getWishlistitemsForLocalFieldsCall, {
            fixture:
                'wishlist/multipleWishlist/categoryPageGetWishListDataForLocalFieldsUpdated.json'
        }).as('getWishlistLocalFields1');
        createWishlistViaDialog('Test List2');
        cy.wait(['@createWishlist2']).should(result => {
            expect(result.request.body.variables).to.eql({
                name: 'Test List2',
                visibility: 'PRIVATE'
            });
            expect(result.response.body).to.exist;
        });
        cy.wait(['@addProductToWishlist']).its('response.body');
        cy.wait(['@getCustomerWishlist3']).its('response.body');
        cy.wait(['@getWishlistLocalFields1']).its('response.body');

        assertWishlistSelectedProductOnCategoryPage(productCarinaCardigan);

        cy.intercept('GET', getCustomerWishlistCall, {
            fixture: 'wishlist/multipleWishlist/twoWishlistOneProductPage.json'
        }).as('getCustomerWishlist4');
        cy.intercept('GET', getMultipleWishlistConfigCall, {
            fixture: 'wishlist/multipleWishlist/multipleWishlistEnabled.json'
        }).as('getWishlistConfig2');
        cy.visitPage(wishistRoute);
        cy.wait(['@getCustomerWishlist4']).its('response.body');
        cy.wait(['@getWishlistConfig2']).its('response.body');

        assertCreateWishlistLink();
        assertProductInWishlist(productCarinaCardigan);

        cy.intercept('GET', getWishlistConfigForProductPageCall, {
            fixture: 'wishlist/multipleWishlist/productPageWishlistConfig.json'
        }).as('getGeneralWishlistConfig');
        cy.intercept('GET', getWishlistDialogDataCall, {
            fixture:
                'wishlist/multipleWishlist/productPageGetWishlistDialogData.json'
        }).as('getProductPageWishlistDialogData');
        cy.visitPage(productAugustaEarningsUrl);
        cy.wait(['@getGeneralWishlistConfig']).its('response.body');
        cy.wait(['@getProductPageWishlistDialogData']).its('response.body');

        addProductToWishlistFromProductPage();

        cy.intercept('POST', hitGraphqlPath, req => {
            if (req.body.operationName.includes('addProductToWishlist')) {
                req.reply({
                    fixture:
                        'wishlist/multipleWishlist/ProductPageAddProductToWishlist.json'
                });
            }
        }).as('addProductToWishlist2');
        cy.intercept('GET', getWishlistDialogDataCall, {
            fixture:
                'wishlist/multipleWishlist/productPageGetWishlistDialogData.json'
        }).as('getProductPageWishlistDialogData2');
        addProductToExistingWishlistFromDialog('Test List1');
        cy.wait(['@addProductToWishlist2']).its('response.body');
        cy.wait(['@getProductPageWishlistDialogData2']).its('response.body');

        assertProductSelectIndicator();

        cy.intercept('GET', getCustomerWishlistCall, {
            fixture: 'wishlist/multipleWishlist/twoWishlistTwoProductPage.json'
        }).as('getCustomerWishlist5');
        cy.intercept('GET', getMultipleWishlistConfigCall, {
            fixture: 'wishlist/multipleWishlist/multipleWishlistEnabled.json'
        }).as('getWishlistConfig3');
        cy.visitPage(wishistRoute);
        cy.wait(['@getCustomerWishlist5']).its('response.body');
        cy.wait(['@getWishlistConfig3']).its('response.body');

        assertCreateWishlistLink();
        assertProductInWishlist(productCarinaCardigan);
        assertProductInWishlist(productAugustaEarningsName);
    });
});
