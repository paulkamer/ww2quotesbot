const expect = require('chai').expect;

const JsonParser = require('../../../../lambda/src/S3/ResultParsers/JsonParser');

describe('JSON S3 resultparser', () => {
  describe('Basic parsing', () => {
    it('parses a string successfully as JSON', (done) => {
      const parser = new JsonParser('{ "key": "value-of-key" }');
      const jsonData = parser.parse();

      expect(jsonData.key).to.equal('value-of-key');
      done();
    });

    it('parses a JSON string surrounded by whitespace', (done) => {
      const parser = new JsonParser(' { "key2": "value2" } ');
      const jsonData = parser.parse();

      expect(jsonData.key2).to.equal('value2');
      done();
    });

    it('parses a JSON string with trailing comma', (done) => {
      const parser = new JsonParser('{ "key3": "value3" },');
      const jsonData = parser.parse();

      expect(jsonData.key3).to.equal('value3');
      done();
    });

    it('parses a JSON string with whitespace and trailing comma', (done) => {
      const parser = new JsonParser(' { "key4": "value4" }, ');
      const jsonData = parser.parse();

      expect(jsonData.key4).to.equal('value4');
      done();
    });
  });

  describe('Reject invalid JSON', () => {
    it('Return false for invalid JSON strings', (done) => {
      const result = new JsonParser('{ key: "value-of-key" }').parse();
      expect(result).to.equal(false);

      const result2 = new JsonParser('{ "key": value-of-key }').parse();
      expect(result2).to.equal(false);

      const result3 = new JsonParser(null).parse();
      expect(result3).to.equal(false);

      done();
    });
  });
});
