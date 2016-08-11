describe("Code Challenge", function() {
  it("should have fullName set to Alan Turing", function() {
    expect(fullName.toLowerCase()).toBe("alan turing");
  });
  it("should have ageAtDeath set to 41", function() {
    expect(ageAtDeath).toEqual(41);
  });
  it("should have myArray containing full name and age", function() {
    expect(myArray).toContain(fullName, ageAtDeath);
  });
  it("should return hello", function() {
    expect(sayHello().toLowerCase()).toContain("hello");
  });
  it("should have splitName array with first element Alan", function() {
    expect(splitName[0].toLowerCase()).toBe("alan");
  });
  it("should have splitName array with second element Turing", function() {
    expect(splitName[1].toLowerCase()).toBe("turing");
  });
  it("should have sayName say Hello, Alan!", function() {
    expect(sayName().toLowerCase()).toContain("hello");
  });
  it("should have sayName say Hello, Alan!", function() {
    expect(sayName().toLowerCase()).toContain(splitName[0].toLowerCase());
  });
  it("should have sayName say Hello, Alan!", function() {
    expect(sayName().toLowerCase()).not.toContain(splitName[1].toLowerCase());
  });
  it("should have alanAgeNow to be 104", function() {
    expect(alanAgeNow(1912)).toEqual(104);
  });
  it("should have sum_odd_numbers equal to 6250000", function() {
    expect(sum_odd_numbers()).toEqual(6250000);
  });
});
