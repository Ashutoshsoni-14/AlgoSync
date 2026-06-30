const Problem = require("../models/Problem");

const cppHeaders = `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <map>
#include <set>
#include <unordered_set>
#include <algorithm>
#include <numeric>
#include <queue>
#include <stack>
#include <cmath>
#include <climits>
using namespace std;`;

const initialProblems = [
  // 1. ARRAYS & HASHING
  {
    title: "Contains Duplicate",
    difficulty: "Easy",
    statement: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    functionName: "containsDuplicate",
    starterCode: {
      cpp: `bool containsDuplicate(vector<int>& nums) {\n    \n}`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}`,
      python: `def containsDuplicate(nums):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> nums;\n    while (cin >> val) {\n        nums.push_back(val);\n    }\n    bool res = containsDuplicate(nums);\n    cout << (res ? "true" : "false");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while (sc.hasNextInt()) {\n            nums.add(sc.nextInt());\n        }\n        int[] numsArray = new int[nums.size()];\n        for (int i = 0; i < nums.size(); i++) {\n            numsArray[i] = nums.get(i);\n        }\n        Solution solver = new Solution();\n        boolean res = solver.containsDuplicate(numsArray);\n        System.out.print(res ? "true" : "false");\n    }\n}`,
      python: `import sys\n\n# USER_CODE\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        print("false", end="")\n        return\n    nums = list(map(int, input_data))\n    res = containsDuplicate(nums)\n    print("true" if res else "false", end="")\n\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "1 2 3 1", output: "true" },
      { input: "1 2 3 4", output: "false" }
    ],
    visibleExamples: [
      { input: "1 2 3 1", output: "true", explanation: "1 appears twice." }
    ],
    constraints: "1 <= nums.length <= 10^5",
    tags: ["Arrays", "Hashing"]
  },
  {
    title: "Group Anagrams",
    difficulty: "Medium",
    statement: "Given an array of strings strs, group the anagrams together. Return the result as a sorted string representation of grouped elements. Stdin inputs are space separated.",
    functionName: "groupAnagrams",
    starterCode: {
      cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {\n    \n}`,
      java: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}`,
      python: `def groupAnagrams(strs):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    string s;\n    vector<string> strs;\n    while (cin >> s) {\n        strs.push_back(s);\n    }\n    vector<vector<string>> res = groupAnagrams(strs);\n    for (auto& row : res) {\n        sort(row.begin(), row.end());\n    }\n    sort(res.begin(), res.end());\n    for (auto& row : res) {\n        for (auto& w : row) cout << w << " ";\n        cout << "\\n";\n    }\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<String> list = new ArrayList<>();\n        while (sc.hasNext()) {\n            list.add(sc.next());\n        }\n        Solution solver = new Solution();\n        List<List<String>> res = solver.groupAnagrams(list.toArray(new String[0]));\n        for (List<String> row : res) {\n            Collections.sort(row);\n        }\n        res.sort((a, b) -> a.get(0).compareTo(b.get(0)));\n        for (List<String> row : res) {\n            for (String w : row) System.out.print(w + " ");\n            System.out.println();\n        }\n    }\n}`,
      python: `import sys\n\n# USER_CODE\n\ndef main():\n    strs = sys.stdin.read().split()\n    res = groupAnagrams(strs)\n    for r in res:\n        r.sort()\n    res.sort(key=lambda x: x[0] if x else "")\n    for r in res:\n        print(" ".join(r))`
    },
    hiddenTestCases: [
      { input: "eat tea tan ate nat bat", output: "bat \neat ate tea \nnat tan " }
    ],
    visibleExamples: [
      { input: "eat tea tan ate nat bat", output: "bat\\neat ate tea\\nnat tan" }
    ],
    constraints: "1 <= strs.length <= 10^4",
    tags: ["Arrays", "Hashing"]
  },

  // 2. TWO POINTERS
  {
    title: "Valid Palindrome",
    difficulty: "Easy",
    statement: "Given a string s, return true if it is a palindrome, or false otherwise. The string input is passed via stdin.",
    functionName: "isPalindrome",
    starterCode: {
      cpp: `bool isPalindrome(string s) {\n    \n}`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}`,
      python: `def isPalindrome(s):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << (isPalindrome(s) ? "true" : "false");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : "";\n        Solution solver = new Solution();\n        System.out.print(solver.isPalindrome(s) ? "true" : "false");\n    }\n}`,
      python: `import sys\n\n# USER_CODE\n\ndef main():\n    s = sys.stdin.read().strip()\n    print("true" if isPalindrome(s) else "false", end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" }
    ],
    visibleExamples: [
      { input: "race a car", output: "false" }
    ],
    constraints: "1 <= s.length <= 2 * 10^5",
    tags: ["Two Pointers"]
  },
  {
    title: "3Sum",
    difficulty: "Medium",
    statement: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    functionName: "threeSum",
    starterCode: {
      cpp: `vector<vector<int>> threeSum(vector<int>& nums) {\n    \n}`,
      java: `class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}`,
      python: `def threeSum(nums):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> nums;\n    while (cin >> val) nums.push_back(val);\n    vector<vector<int>> res = threeSum(nums);\n    for (auto& t : res) sort(t.begin(), t.end());\n    sort(res.begin(), res.end());\n    for (auto& t : res) cout << t[0] << " " << t[1] << " " << t[2] << "\\n";\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while (sc.hasNextInt()) nums.add(sc.nextInt());\n        int[] arr = new int[nums.size()];\n        for (int i=0; i<nums.size(); i++) arr[i] = nums.get(i);\n        Solution solver = new Solution();\n        List<List<Integer>> res = solver.threeSum(arr);\n        for (List<Integer> t : res) Collections.sort(t);\n        res.sort((a,b) -> a.get(0).equals(b.get(0)) ? a.get(1).compareTo(b.get(1)) : a.get(0).compareTo(b.get(0)));\n        for (List<Integer> t : res) System.out.println(t.get(0) + " " + t.get(1) + " " + t.get(2));\n    }\n}`,
      python: `import sys\n\n# USER_CODE\n\ndef main():\n    nums = list(map(int, sys.stdin.read().split()))\n    res = threeSum(nums)\n    for r in res: r.sort()\n    res.sort()\n    for r in res: print(f"{r[0]} {r[1]} {r[2]}")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1\n" }
    ],
    visibleExamples: [
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2\\n-1 0 1" }
    ],
    constraints: "3 <= nums.length <= 3000",
    tags: ["Two Pointers"]
  },

  // 3. SLIDING WINDOW
  {
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    statement: "You are given an array prices where prices[i] is the price of a given stock on the i-th day. Return the maximum profit you can achieve.",
    functionName: "maxProfit",
    starterCode: {
      cpp: `int maxProfit(vector<int>& prices) {\n    \n}`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}`,
      python: `def maxProfit(prices):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> prices;\n    while (cin >> val) prices.push_back(val);\n    cout << maxProfit(prices);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> prices = new ArrayList<>();\n        while (sc.hasNextInt()) prices.add(sc.nextInt());\n        int[] arr = new int[prices.size()];\n        for (int i=0; i<prices.size(); i++) arr[i] = prices.get(i);\n        Solution solver = new Solution();\n        System.out.print(solver.maxProfit(arr));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    prices = list(map(int, sys.stdin.read().split()))\n    print(maxProfit(prices), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "7 1 5 3 6 4", output: "5" },
      { input: "7 6 4 3 1", output: "0" }
    ],
    visibleExamples: [
      { input: "7 1 5 3 6 4", output: "5" }
    ],
    constraints: "1 <= prices.length <= 10^5",
    tags: ["Sliding Window"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    statement: "Given a string s, find the length of the longest substring without repeating characters.",
    functionName: "lengthOfLongestSubstring",
    starterCode: {
      cpp: `int lengthOfLongestSubstring(string s) {\n    \n}`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}`,
      python: `def lengthOfLongestSubstring(s):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    string s;\n    if (cin >> s) cout << lengthOfLongestSubstring(s);\n    else cout << 0;\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        Solution solver = new Solution();\n        System.out.print(solver.lengthOfLongestSubstring(s));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    s = sys.stdin.read().strip()\n    print(lengthOfLongestSubstring(s), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" }
    ],
    visibleExamples: [
      { input: "abcabcbb", output: "3" }
    ],
    constraints: "0 <= s.length <= 5 * 10^4",
    tags: ["Sliding Window"]
  },

  // 4. STACK
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    functionName: "isValid",
    starterCode: {
      cpp: `bool isValid(string s) {\n    \n}`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}`,
      python: `def isValid(s):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    string s;\n    if (cin >> s) cout << (isValid(s) ? "true" : "false");\n    else cout << "true";\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        Solution solver = new Solution();\n        System.out.print(solver.isValid(s) ? "true" : "false");\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    s = sys.stdin.read().strip()\n    print("true" if isValid(s) else "false", end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ],
    visibleExamples: [
      { input: "()[]{}", output: "true" }
    ],
    constraints: "1 <= s.length <= 10^4",
    tags: ["Stack"]
  },
  {
    title: "Min Stack",
    difficulty: "Medium",
    statement: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time. Implement the MinStack class.",
    functionName: "MinStack",
    starterCode: {
      cpp: `class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};`,
      java: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
      python: `class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        return 0\n    def getMin(self) -> int:\n        return 0`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    MinStack* obj = new MinStack();\n    string op;\n    int val;\n    while (cin >> op) {\n        if (op == "push") {\n            cin >> val;\n            obj->push(val);\n        } else if (op == "pop") {\n            obj->pop();\n        } else if (op == "top") {\n            cout << obj->top() << " ";\n        } else if (op == "getMin") {\n            cout << obj->getMin() << " ";\n        }\n    }\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        MinStack obj = new MinStack();\n        while (sc.hasNext()) {\n            String op = sc.next();\n            if (op.equals("push")) {\n                obj.push(sc.nextInt());\n            } else if (op.equals("pop")) {\n                obj.pop();\n            } else if (op.equals("top")) {\n                System.out.print(obj.top() + " ");\n            } else if (op.equals("getMin")) {\n                System.out.print(obj.getMin() + " ");\n            }\n        }\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = sys.stdin.read().split()\n    obj = MinStack()\n    i = 0\n    while i < len(lines):\n        op = lines[i]\n        if op == "push":\n            obj.push(int(lines[i+1]))\n            i += 2\n        elif op == "pop":\n            obj.pop()\n            i += 1\n        elif op == "top":\n            print(obj.top(), end=" ")\n            i += 1\n        elif op == "getMin":\n            print(obj.getMin(), end=" ")\n            i += 1\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "push -2 push 0 push -3 getMin pop top getMin", output: "-3 0 -2 " }
    ],
    visibleExamples: [
      { input: "push -2 push 0 push -3 getMin pop top getMin", output: "-3 0 -2" }
    ],
    constraints: "-2^31 <= val <= 2^31 - 1",
    tags: ["Stack"]
  },

  // 5. BINARY SEARCH
  {
    title: "Binary Search",
    difficulty: "Easy",
    statement: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    functionName: "search",
    starterCode: {
      cpp: `int search(vector<int>& nums, int target) {\n    \n}`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}`,
      python: `def search(nums, target):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> nums;\n    while (cin >> val) nums.push_back(val);\n    if (nums.size() < 2) return 0;\n    int target = nums.back();\n    nums.pop_back();\n    cout << search(nums, target);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while (sc.hasNextInt()) nums.add(sc.nextInt());\n        if (nums.size() < 2) return;\n        int target = nums.remove(nums.size() - 1);\n        int[] arr = new int[nums.size()];\n        for (int i=0; i<nums.size(); i++) arr[i] = nums.get(i);\n        Solution solver = new Solution();\n        System.out.print(solver.search(arr, target));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    nums = list(map(int, sys.stdin.read().split()))\n    target = nums.pop()\n    print(search(nums, target), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "-1 0 3 5 9 12 9", output: "4" }
    ],
    visibleExamples: [
      { input: "-1 0 3 5 9 12 9", output: "4" }
    ],
    constraints: "1 <= nums.length <= 10^4",
    tags: ["Binary Search"]
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    statement: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Find the minimum element of this array.",
    functionName: "findMin",
    starterCode: {
      cpp: `int findMin(vector<int>& nums) {\n    \n}`,
      java: `class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}`,
      python: `def findMin(nums):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> nums;\n    while (cin >> val) nums.push_back(val);\n    cout << findMin(nums);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while (sc.hasNextInt()) nums.add(sc.nextInt());\n        int[] arr = new int[nums.size()];\n        for (int i=0; i<nums.size(); i++) arr[i] = nums.get(i);\n        Solution solver = new Solution();\n        System.out.print(solver.findMin(arr));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    nums = list(map(int, sys.stdin.read().split()))\n    print(findMin(nums), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "3 4 5 1 2", output: "1" }
    ],
    visibleExamples: [
      { input: "3 4 5 1 2", output: "1" }
    ],
    constraints: "1 <= nums.length <= 5000",
    tags: ["Binary Search"]
  },

  // 6. LINKED LIST
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    statement: "Given the head of a singly linked list, reverse the list, and return the reversed list nodes as space-separated integers in stdin.",
    functionName: "reverseList",
    starterCode: {
      cpp: `// Definition for singly-linked list node is assumed as standard Node.\nvector<int> reverseList(vector<int>& head) {\n    \n}`,
      java: `class Solution {\n    public List<Integer> reverseList(List<Integer> head) {\n        \n    }\n}`,
      python: `def reverseList(head):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> head;\n    while (cin >> val) head.push_back(val);\n    vector<int> res = reverseList(head);\n    for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> head = new ArrayList<>();\n        while (sc.hasNextInt()) head.add(sc.nextInt());\n        Solution solver = new Solution();\n        List<Integer> res = solver.reverseList(head);\n        for (int i = 0; i < res.size(); i++) System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    head = list(map(int, sys.stdin.read().split()))\n    res = reverseList(head)\n    if res: print(" ".join(map(str, res)), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "1 2 3 4 5", output: "5 4 3 2 1" }
    ],
    visibleExamples: [
      { input: "1 2 3 4 5", output: "5 4 3 2 1" }
    ],
    constraints: "The number of nodes in the list is in the range [0, 5000].",
    tags: ["Linked List"]
  },
  {
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    statement: "Given the head of a linked list, remove the n-th node from the end of the list and return its head. The last integer in stdin represents 'n'.",
    functionName: "removeNthFromEnd",
    starterCode: {
      cpp: `vector<int> removeNthFromEnd(vector<int>& head, int n) {\n    \n}`,
      java: `class Solution {\n    public List<Integer> removeNthFromEnd(List<Integer> head, int n) {\n        \n    }\n}`,
      python: `def removeNthFromEnd(head, n):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> head;\n    while (cin >> val) head.push_back(val);\n    if (head.empty()) return 0;\n    int n = head.back();\n    head.pop_back();\n    vector<int> res = removeNthFromEnd(head, n);\n    for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> head = new ArrayList<>();\n        while (sc.hasNextInt()) head.add(sc.nextInt());\n        if (head.isEmpty()) return;\n        int n = head.remove(head.size() - 1);\n        Solution solver = new Solution();\n        List<Integer> res = solver.removeNthFromEnd(head, n);\n        for (int i = 0; i < res.size(); i++) System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    head = list(map(int, sys.stdin.read().split()))\n    if not head: return\n    n = head.pop()\n    res = removeNthFromEnd(head, n)\n    if res: print(" ".join(map(str, res)), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "1 2 3 4 5 2", output: "1 2 3 5" }
    ],
    visibleExamples: [
      { input: "1 2 3 4 5 2", output: "1 2 3 5" }
    ],
    constraints: "The number of nodes in the list is sz.",
    tags: ["Linked List"]
  },

  // 7. TREES
  {
    title: "Invert Binary Tree",
    difficulty: "Easy",
    statement: "Given the level-order traversal of a binary tree, invert the tree, and return its level-order representation.",
    functionName: "invertTree",
    starterCode: {
      cpp: `vector<int> invertTree(vector<int>& root) {\n    \n}`,
      java: `class Solution {\n    public List<Integer> invertTree(List<Integer> root) {\n        \n    }\n}`,
      python: `def invertTree(root):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> root;\n    while (cin >> val) root.push_back(val);\n    vector<int> res = invertTree(root);\n    for (int i = 0; i < res.size(); i++) cout << res[i] << (i == res.size() - 1 ? "" : " ");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> root = new ArrayList<>();\n        while (sc.hasNextInt()) root.add(sc.nextInt());\n        Solution solver = new Solution();\n        List<Integer> res = solver.invertTree(root);\n        for (int i = 0; i < res.size(); i++) System.out.print(res.get(i) + (i == res.size() - 1 ? "" : " "));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    root = list(map(int, sys.stdin.read().split()))\n    res = invertTree(root)\n    if res: print(" ".join(map(str, res)), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "4 2 7 1 3 6 9", output: "4 7 2 9 6 3 1" }
    ],
    visibleExamples: [
      { input: "4 2 7 1 3 6 9", output: "4 7 2 9 6 3 1" }
    ],
    constraints: "The number of nodes in the tree is sz.",
    tags: ["Trees"]
  },
  {
    title: "Kth Smallest Element in a BST",
    difficulty: "Medium",
    statement: "Given the level order representation of a binary search tree (using -1 for nulls) and an integer k (as the last integer in stdin), return the kth smallest value.",
    functionName: "kthSmallest",
    starterCode: {
      cpp: `int kthSmallest(vector<int>& root, int k) {\n    \n}`,
      java: `class Solution {\n    public int kthSmallest(List<Integer> root, int k) {\n        \n    }\n}`,
      python: `def kthSmallest(root, k):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> root;\n    while (cin >> val) root.push_back(val);\n    if (root.empty()) return 0;\n    int k = root.back();\n    root.pop_back();\n    cout << kthSmallest(root, k);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> root = new ArrayList<>();\n        while (sc.hasNextInt()) root.add(sc.nextInt());\n        if (root.isEmpty()) return;\n        int k = root.remove(root.size() - 1);\n        Solution solver = new Solution();\n        System.out.print(solver.kthSmallest(root, k));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    root = list(map(int, sys.stdin.read().split()))\n    if not root: return\n    k = root.pop()\n    print(kthSmallest(root, k), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "3 1 4 -1 2 1", output: "1" }
    ],
    visibleExamples: [
      { input: "3 1 4 -1 2 1", output: "1" }
    ],
    constraints: "The number of nodes in the tree is n.",
    tags: ["Trees"]
  },

  // 8. GRAPHS
  {
    title: "Island Perimeter",
    difficulty: "Easy",
    statement: "You are given row x col grid representing a map where 1 represents land and 0 represents water. Find the perimeter of the island.",
    functionName: "islandPerimeter",
    starterCode: {
      cpp: `int islandPerimeter(vector<vector<int>>& grid) {\n    \n}`,
      java: `class Solution {\n    public int islandPerimeter(int[][] grid) {\n        \n    }\n}`,
      python: `def islandPerimeter(grid):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int r, c;\n    if (!(cin >> r >> c)) return 0;\n    vector<vector<int>> grid(r, vector<int>(c));\n    for (int i=0; i<r; i++) {\n        for (int j=0; j<c; j++) cin >> grid[i][j];\n    }\n    cout << islandPerimeter(grid);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int r = sc.nextInt();\n        int c = sc.nextInt();\n        int[][] grid = new int[r][c];\n        for (int i=0; i<r; i++) {\n            for (int j=0; j<c; j++) grid[i][j] = sc.nextInt();\n        }\n        Solution solver = new Solution();\n        System.out.print(solver.islandPerimeter(grid));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    data = list(map(int, sys.stdin.read().split()))\n    if not data: return\n    r, c = data[0], data[1]\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append(data[idx : idx + c])\n        idx += c\n    print(islandPerimeter(grid), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "4 4 0 1 0 0 1 1 1 0 0 1 0 0 1 1 0 0", output: "16" }
    ],
    visibleExamples: [
      { input: "4 4 0 1 0 0 1 1 1 0 0 1 0 0 1 1 0 0", output: "16" }
    ],
    constraints: "row == grid.length",
    tags: ["Graphs"]
  },
  {
    title: "Number of Islands",
    difficulty: "Medium",
    statement: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    functionName: "numIslands",
    starterCode: {
      cpp: `int numIslands(vector<vector<char>>& grid) {\n    \n}`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}`,
      python: `def numIslands(grid):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int r, c;\n    if (!(cin >> r >> c)) return 0;\n    vector<vector<char>> grid(r, vector<char>(c));\n    for (int i=0; i<r; i++) {\n        for (int j=0; j<c; j++) cin >> grid[i][j];\n    }\n    cout << numIslands(grid);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int r = sc.nextInt();\n        int c = sc.nextInt();\n        char[][] grid = new char[r][c];\n        for (int i=0; i<r; i++) {\n            String row = sc.next();\n            for (int j=0; j<c; j++) grid[i][j] = row.charAt(j);\n        }\n        Solution solver = new Solution();\n        System.out.print(solver.numIslands(grid));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    r, c = int(lines[0]), int(lines[1])\n    grid = []\n    for i in range(r):\n        grid.append(list(lines[2+i]))\n    print(numIslands(grid), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "4 5 11110 11010 11000 00000", output: "1" }
    ],
    visibleExamples: [
      { input: "4 5 11110 11010 11000 00000", output: "1" }
    ],
    constraints: "m == grid.length",
    tags: ["Graphs"]
  },

  // 9. HEAP / PRIORITY QUEUE
  {
    title: "Kth Largest Element in a Stream",
    difficulty: "Easy",
    statement: "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element.",
    functionName: "KthLargest",
    starterCode: {
      cpp: `class KthLargest {\npublic:\n    KthLargest(int k, vector<int>& nums) {}\n    int add(int val) { return 0; }\n};`,
      java: `class KthLargest {\n    public KthLargest(int k, int[] nums) {}\n    public int add(int val) { return 0; }\n}`,
      python: `class KthLargest:\n    def __init__(self, k: int, nums: List[int]):\n        pass\n    def add(self, val: int) -> int:\n        return 0`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int k, n, val;\n    if (!(cin >> k >> n)) return 0;\n    vector<int> nums(n);\n    for (int i=0; i<n; i++) cin >> nums[i];\n    KthLargest* obj = new KthLargest(k, nums);\n    while (cin >> val) {\n        cout << obj->add(val) << " ";\n    }\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int k = sc.nextInt();\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i=0; i<n; i++) arr[i] = sc.nextInt();\n        KthLargest obj = new KthLargest(k, arr);\n        while (sc.hasNextInt()) {\n            System.out.print(obj.add(sc.nextInt()) + " ");\n        }\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = list(map(int, sys.stdin.read().split()))\n    if not lines: return\n    k, n = lines[0], lines[1]\n    nums = lines[2 : 2+n]\n    obj = KthLargest(k, nums)\n    for val in lines[2+n :]:\n        print(obj.add(val), end=" ")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "3 4 4 5 8 2 3 5 10 9 4", output: "4 5 5 8 8 " }
    ],
    visibleExamples: [
      { input: "3 4 4 5 8 2 3 5 10 9 4", output: "4 5 5 8 8" }
    ],
    constraints: "1 <= k <= 10^4",
    tags: ["Heap"]
  },
  {
    title: "K Closest Points to Origin",
    difficulty: "Medium",
    statement: "Given an array of points where points[i] = [xi, yi] and an integer k, return the k closest points to the origin (0, 0).",
    functionName: "kClosest",
    starterCode: {
      cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {\n    \n}`,
      java: `class Solution {\n    public int[][] kClosest(int[][] points, int k) {\n        \n    }\n}`,
      python: `def kClosest(points, k):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int n, k;\n    if (!(cin >> n >> k)) return 0;\n    vector<vector<int>> points(n, vector<int>(2));\n    for (int i=0; i<n; i++) cin >> points[i][0] >> points[i][1];\n    vector<vector<int>> res = kClosest(points, k);\n    for (auto& p : res) sort(p.begin(), p.end());\n    sort(res.begin(), res.end());\n    for (auto& p : res) cout << p[0] << " " << p[1] << "\\n";\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int k = sc.nextInt();\n        int[][] points = new int[n][2];\n        for (int i=0; i<n; i++) {\n            points[i][0] = sc.nextInt();\n            points[i][1] = sc.nextInt();\n        }\n        Solution solver = new Solution();\n        int[][] res = solver.kClosest(points, k);\n        for (int[] p : res) Arrays.sort(p);\n        Arrays.sort(res, (a, b) -> a[0] == b[0] ? Integer.compare(a[1], b[1]) : Integer.compare(a[0], b[0]));\n        for (int[] p : res) System.out.println(p[0] + " " + p[1]);\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = list(map(int, sys.stdin.read().split()))\n    if not lines: return\n    n, k = lines[0], lines[1]\n    points = []\n    idx = 2\n    for i in range(n):\n        points.append([lines[idx], lines[idx+1]])\n        idx += 2\n    res = kClosest(points, k)\n    for p in res: p.sort()\n    res.sort()\n    for p in res: print(f"{p[0]} {p[1]}")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "2 1 1 3 -2 2", output: "-2 2\n" }
    ],
    visibleExamples: [
      { input: "2 1 1 3 -2 2", output: "-2 2" }
    ],
    constraints: "1 <= k <= points.length <= 10^4",
    tags: ["Heap"]
  },

  // 10. DYNAMIC PROGRAMMING
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    functionName: "climbStairs",
    starterCode: {
      cpp: `int climbStairs(int n) {\n    \n}`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}`,
      python: `def climbStairs(n):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int n;\n    if (cin >> n) cout << climbStairs(n);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            Solution solver = new Solution();\n            System.out.print(solver.climbStairs(sc.nextInt()));\n        }\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = sys.stdin.read().split()\n    if lines: print(climbStairs(int(lines[0])), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" }
    ],
    visibleExamples: [
      { input: "2", output: "2" }
    ],
    constraints: "1 <= n <= 45",
    tags: ["DP"]
  },
  {
    title: "House Robber",
    difficulty: "Medium",
    statement: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Return the maximum amount of money you can rob tonight without alerting the police.",
    functionName: "rob",
    starterCode: {
      cpp: `int rob(vector<int>& nums) {\n    \n}`,
      java: `class Solution {\n    public int rob(int[] nums) {\n        \n    }\n}`,
      python: `def rob(nums):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> nums;\n    while (cin >> val) nums.push_back(val);\n    cout << rob(nums);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> nums = new ArrayList<>();\n        while (sc.hasNextInt()) nums.add(sc.nextInt());\n        int[] arr = new int[nums.size()];\n        for (int i=0; i<nums.size(); i++) arr[i] = nums.get(i);\n        Solution solver = new Solution();\n        System.out.print(solver.rob(arr));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    nums = list(map(int, sys.stdin.read().split()))\n    print(rob(nums), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "1 2 3 1", output: "4" },
      { input: "2 7 9 3 1", output: "12" }
    ],
    visibleExamples: [
      { input: "1 2 3 1", output: "4" }
    ],
    constraints: "1 <= nums.length <= 100",
    tags: ["DP"]
  },

  // 11. HARD PROBLEMS
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    statement: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    functionName: "trap",
    starterCode: {
      cpp: `int trap(vector<int>& height) {\n    \n}`,
      java: `class Solution {\n    public int trap(int[] height) {\n        \n    }\n}`,
      python: `def trap(height):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int val;\n    vector<int> height;\n    while (cin >> val) height.push_back(val);\n    cout << trap(height);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) list.add(sc.nextInt());\n        int[] arr = new int[list.size()];\n        for (int i=0; i<list.size(); i++) arr[i] = list.get(i);\n        Solution solver = new Solution();\n        System.out.print(solver.trap(arr));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    h = list(map(int, sys.stdin.read().split()))\n    print(trap(h), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }
    ],
    visibleExamples: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", output: "6" }
    ],
    constraints: "n == height.length",
    tags: ["Two Pointers"]
  },
  {
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    statement: "You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    functionName: "mergeKLists",
    starterCode: {
      cpp: `vector<int> mergeKLists(vector<vector<int>>& lists) {\n    \n}`,
      java: `class Solution {\n    public List<Integer> mergeKLists(List<List<Integer>> lists) {\n        \n    }\n}`,
      python: `def mergeKLists(lists):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int k;\n    if (!(cin >> k)) return 0;\n    vector<vector<int>> lists(k);\n    for (int i=0; i<k; i++) {\n        int sz;\n        cin >> sz;\n        lists[i].resize(sz);\n        for (int j=0; j<sz; j++) cin >> lists[i][j];\n    }\n    vector<int> res = mergeKLists(lists);\n    for (int i=0; i<res.size(); i++) cout << res[i] << (i == res.size()-1 ? "" : " ");\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int k = sc.nextInt();\n        List<List<Integer>> lists = new ArrayList<>();\n        for (int i=0; i<k; i++) {\n            int sz = sc.nextInt();\n            List<Integer> sub = new ArrayList<>();\n            for (int j=0; j<sz; j++) sub.add(sc.nextInt());\n            lists.add(sub);\n        }\n        Solution solver = new Solution();\n        List<Integer> res = solver.mergeKLists(lists);\n        for (int i=0; i<res.size(); i++) System.out.print(res.get(i) + (i == res.size()-1 ? "" : " "));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    data = list(map(int, sys.stdin.read().split()))\n    if not data: return\n    k = data[0]\n    lists = []\n    idx = 1\n    for i in range(k):\n        sz = data[idx]\n        lists.append(data[idx+1 : idx+1+sz])\n        idx += 1 + sz\n    res = mergeKLists(lists)\n    if res: print(" ".join(map(str, res)), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "3 3 1 4 5 3 1 3 4 2 2 6", output: "1 1 2 3 4 4 5 6" }
    ],
    visibleExamples: [
      { input: "3 3 1 4 5 3 1 3 4 2 2 6", output: "1 1 2 3 4 4 5 6" }
    ],
    constraints: "k == lists.length",
    tags: ["Linked List", "Heap"]
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    statement: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The length of nums1 is the first integer in stdin.",
    functionName: "findMedianSortedArrays",
    starterCode: {
      cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n    \n}`,
      java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}`,
      python: `def findMedianSortedArrays(nums1, nums2):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int m;\n    if (!(cin >> m)) return 0;\n    vector<int> nums1(m);\n    for (int i=0; i<m; i++) cin >> nums1[i];\n    int val;\n    vector<int> nums2;\n    while (cin >> val) nums2.push_back(val);\n    printf("%.5f", findMedianSortedArrays(nums1, nums2));\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int m = sc.nextInt();\n        int[] nums1 = new int[m];\n        for (int i=0; i<m; i++) nums1[i] = sc.nextInt();\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums2 = new int[list.size()];\n        for (int i=0; i<list.size(); i++) nums2[i] = list.get(i);\n        Solution solver = new Solution();\n        System.out.printf(Locale.US, "%.5f", solver.findMedianSortedArrays(nums1, nums2));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = list(map(int, sys.stdin.read().split()))\n    if not lines: return\n    m = lines[0]\n    nums1 = lines[1 : 1+m]\n    nums2 = lines[1+m :]\n    ans = findMedianSortedArrays(nums1, nums2)\n    print(f"{ans:.5f}", end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "2 1 3 1 2", output: "2.00000" }
    ],
    visibleExamples: [
      { input: "2 1 3 1 2", output: "2.00000" }
    ],
    constraints: "nums1.length == m",
    tags: ["Binary Search"]
  },
  {
    title: "N-Queens",
    difficulty: "Hard",
    statement: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the number of distinct solutions.",
    functionName: "totalNQueens",
    starterCode: {
      cpp: `int totalNQueens(int n) {\n    \n}`,
      java: `class Solution {\n    public int totalNQueens(int n) {\n        \n    }\n}`,
      python: `def totalNQueens(n):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    int n;\n    if (cin >> n) cout << totalNQueens(n);\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            Solution solver = new Solution();\n            System.out.print(solver.totalNQueens(sc.nextInt()));\n        }\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    lines = sys.stdin.read().split()\n    if lines: print(totalNQueens(int(lines[0])), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: "4", output: "2" },
      { input: "8", output: "92" }
    ],
    visibleExamples: [
      { input: "4", output: "2" }
    ],
    constraints: "1 <= n <= 9",
    tags: ["DP"]
  },
  {
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    statement: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    functionName: "longestValidParentheses",
    starterCode: {
      cpp: `int longestValidParentheses(string s) {\n    \n}`,
      java: `class Solution {\n    public int longestValidParentheses(String s) {\n        \n    }\n}`,
      python: `def longestValidParentheses(s):\n    pass`
    },
    wrappers: {
      cpp: `${cppHeaders}\n\n// USER_CODE\n\nint main() {\n    string s;\n    if (cin >> s) cout << longestValidParentheses(s);\n    else cout << 0;\n    return 0;\n}`,
      java: `import java.util.*;\n\n// USER_CODE\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNext() ? sc.next() : "";\n        Solution solver = new Solution();\n        System.out.print(solver.longestValidParentheses(s));\n    }\n}`,
      python: `import sys\n# USER_CODE\ndef main():\n    s = sys.stdin.read().strip()\n    print(longestValidParentheses(s), end="")\nif __name__ == "__main__":\n    main()`
    },
    hiddenTestCases: [
      { input: ")()())", output: "4" }
    ],
    visibleExamples: [
      { input: ")()())", output: "4" }
    ],
    constraints: "0 <= s.length <= 3 * 10^4",
    tags: ["Stack", "DP"]
  }
];

const seedProblems = async () => {
  try {
    console.log("Seeding exactly 25 curated fully executable C++, Java, & Python problems...");
    await Problem.deleteMany({});
    await Problem.insertMany(initialProblems);
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
  }
};

module.exports = seedProblems;
