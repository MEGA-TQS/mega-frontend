Feature: Sanity Check
  To ensure the BDD pipeline is working
  I want to visit a public website and check the title

  Scenario: User visits Example.com
    Given I open "https://example.com"
    Then I should see the page title "Example Domain"