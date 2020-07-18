const expect = require('chai').expect;

const JsonParser = require('../../../../src/ww2bot/src/S3/ResultParsers/JsonParser');

describe('JSON S3 resultparser', () => {
  describe('Basic parsing', () => {
    it('parses a string successfully as JSON', () => {
      const parser = new JsonParser('{ "key": "value-of-key" }');
      const jsonData = parser.parse();

      expect(jsonData.key).to.equal('value-of-key');
    });

    it('parses a JSON string surrounded by whitespace', () => {
      const parser = new JsonParser(' { "key2": "value2" } ');
      const jsonData = parser.parse();

      expect(jsonData.key2).to.equal('value2');
    });
  });

  describe('Reject invalid JSON', () => {
    it('Return false for invalid JSON strings', () => {
      const result = new JsonParser('{ key: "value-of-key" }').parse();
      expect(result).to.equal(false);

      const result2 = new JsonParser('{ "key": value-of-key }').parse();
      expect(result2).to.equal(false);

      const result3 = new JsonParser('{ "key": "value-of-key" },').parse();
      expect(result3).to.equal(false);

      const result4 = new JsonParser(null).parse();
      expect(result4).to.equal(false);
    });
  });
});
