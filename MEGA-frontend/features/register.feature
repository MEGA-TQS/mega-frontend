Feature: User Registration
  As a new user
  I want to register an account on the MEGA platform
  So that I can rent and list items

  Background:
    Given I am on the "register" page

  Scenario: Registration form is displayed correctly
    Then I should see "Create Account"
    And I should see "Full Name"
    And I should see "Email"
    And I should see "Password"

  Scenario: Registration fails when passwords do not match
    When I type "Test User" in the "name" field
    And I type "test@test.com" in the "email" field
    And I type "password123" in the "password" field
    And I type "differentpassword" in the "confirmPassword" field
    And I click the "Register" button
    Then I should see "Passwords do not match"

  Scenario: Navigate to login page from register
    When I click the "Login here" link
    Then I should be on the "login" page
