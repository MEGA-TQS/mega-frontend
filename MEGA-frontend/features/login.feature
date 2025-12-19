Feature: User Login
  As a user of the MEGA platform
  I want to be able to login to my account
  So that I can access my bookings and listings

  Background:
    Given I am on the "login" page

  Scenario: Successful login with valid credentials
    When I type "user@test.com" in the "email" field
    And I click the "Login" button
    Then I should be on the "home" page
    And I should see "Hi, Regular"

  Scenario: Login with invalid credentials shows error
    When I type "invalid@email.com" in the "email" field
    And I click the "Login" button
    Then I should see "User not found"

  Scenario: Quick login as User
    When I click the "Login as User" button
    Then I should be on the "home" page
    And I should see "Hi, Regular"

  Scenario: Quick login as Admin
    When I click the "Login as Admin" button
    Then I should see "Hi, Admin"

  Scenario: Navigate to register page from login
    When I click the "Register here" link
    Then I should be on the "register" page
