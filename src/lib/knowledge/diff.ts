type DiffLine = {
  type: "added" | "removed" | "unchanged";
  text: string;
  oldNum: number | null;
  newNum: number | null;
};

export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const m = oldLines.length;
  const n = newLines.length;

  // LCS DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        oldLines[i] === newLines[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNum = 1;
  let newNum = 1;

  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      result.push({
        type: "unchanged",
        text: oldLines[i],
        oldNum,
        newNum,
      });
      i++;
      j++;
      oldNum++;
      newNum++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "removed", text: oldLines[i], oldNum, newNum: null });
      i++;
      oldNum++;
    } else {
      result.push({ type: "added", text: newLines[j], oldNum: null, newNum });
      j++;
      newNum++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", text: oldLines[i], oldNum, newNum: null });
    i++;
    oldNum++;
  }
  while (j < n) {
    result.push({ type: "added", text: newLines[j], oldNum: null, newNum });
    j++;
    newNum++;
  }

  return result;
}

export type { DiffLine };