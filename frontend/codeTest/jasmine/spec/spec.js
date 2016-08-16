describe("Code Challenge", function() {
  it("should have fullName set to Linus Torvalds and yearBorn set to 1969", function() {
    expect(fullName.toLowerCase()).toBe("linus torvalds");
    expect(yearBorn).toEqual(1969);
  });
  it("should have myArray containing full name and yearBorn", function() {
    expect(myArray).toContain(fullName, yearBorn);
  });
  it("should return hello", function() {
    expect(sayHello().toLowerCase()).toContain("hello");
  });
  it("should have splitName array with first element Linus and second element Torvalds", function() {
    expect(splitName[0].toLowerCase()).toBe("linus");
    expect(splitName[1].toLowerCase()).toBe("torvalds");
  });
  it("should have sayName say Hello, Linus!", function() {
    expect(sayName().toLowerCase()).toContain("hello");
    expect(sayName().toLowerCase()).toContain(splitName[0].toLowerCase());
    expect(sayName().toLowerCase()).not.toContain(splitName[1].toLowerCase());
  });
  it("should have linusAge to be his age", function() {
    // var baseTime = new Date()
    var age = new Date().getFullYear() - 1969;
    expect(linusAge(1969)).toEqual(age);
  });
  it("should have sum_odd_numbers equal to 6250000", function() {
    expect(sum_odd_numbers()).toEqual(6250000);
  });
});
