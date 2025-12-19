Feature: Booking
  As a logged in user
  I want to access my bookings
  So that I can manage my rentals

  Scenario: View my bookings page after login
    Given I am on the "login" page
    When I click the "Login as User" button
    And I click the "My Bookings" link
    Then I should see "My Bookings"

  Scenario: My bookings page shows empty state
    Given I am on the "login" page
    When I click the "Login as User" button
    And I am on the "my bookings" page
    Then I should see "My Bookings"
