Feature: User Login
  As a user of the MEGA platform
  I want to be able to login to my account
  So that I can access my bookings and listings

  Background:
    Given I am on the "login" page

  Scenario: Successful login with valid credentials
    When I type "user@test.com" in the "email" field
    And I type "password123" in the "password" field
    And I click the "Login" button
    Then I should be on the "home" page

  Scenario: Login with invalid credentials shows error
    When I type "invalid@email.com" in the "email" field
    And I type "wrong" in the "password" field
    And I click the "Login" button
    Then I should see "Invalid email or password."