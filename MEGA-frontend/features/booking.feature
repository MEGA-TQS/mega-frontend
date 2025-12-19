Feature: Booking
  As a logged in user
  I want to access my bookings
  So that I can manage my rentals

  Scenario: View my bookings page after login
    Given I am on the "login" page
    When I type "user@test.com" in the "email" field
    And I type "password123" in the "password" field
    And I click the "Login" button
    # And I click the "My Bookings" link
    # Then I should see "My Bookings"