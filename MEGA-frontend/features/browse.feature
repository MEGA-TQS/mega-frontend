Feature: Browse Items
  As a user
  I want to browse available items on the platform
  So that I can find items to rent

  Background:
    Given I am on the "browse" page

  Scenario: View browse page with filter options
    Then I should see "Filter Results"
    And I should see "Search"
    And I should see "Category"
    And I should see "Location"

  Scenario: Filter section has clear button
    Then I should see "Clear Filters"

  Scenario: Browse page shows results section
    Then I should see "Results"
