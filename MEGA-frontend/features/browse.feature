Feature: Browse Items
  Background:
    Given I am on the "browse" page

  Scenario: View browse page with filter options
    Then I should see "Filter Results"
    # Matches your updated label: <label>Search</label>
    And I should see "Search" 
    And I should see "Category"
    And I should see "Location"

  Scenario: Filter items by Category
    # Selects from <select name="category">
    When I select "Cycling" from "category"
    # Matches <h4 className="m-0">... Results</h4>
    Then I should see "Results"
    # Matches the item card badge: <span className="badge">Cycling</span>
    And I should see "Cycling"

  Scenario: Browse page shows results section
    # Validates the result grid header
    Then I should see "Results"