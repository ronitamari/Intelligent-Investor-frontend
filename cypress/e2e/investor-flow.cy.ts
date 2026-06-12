describe('Intelligent Investor flow', () => {
  it('inputs salary, shows buckets, and renders the chart', () => {
    cy.intercept('GET', '**/profiles', []);
    cy.intercept('POST', '**/calculations', {
      grossSalary: 10000,
      bankNet: 8000,
      bankNetWasEstimated: false,
      fixedCostsPercentage: 55,
      guiltFreePercentage: 27.5,
      fixedCosts: 4400,
      savingsGoals: 800,
      activeInvestments: 800,
      guiltFreeSpending: 2200,
      wealthProjection: Array.from({ length: 15 }, (_, index) => ({
        year: index + 1,
        value: 10272 * Math.pow(1.07, index),
      })),
    });

    cy.visit('/');
    cy.get('#grossSalary').type('10000');
    cy.get('#bankNet').type('8000');
    cy.contains('$4,400').should('be.visible');
    cy.contains('$2,200').should('be.visible');
    cy.get('[data-testid="projection-chart"]').should('be.visible');
  });
});
