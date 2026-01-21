#include<iostream>
using namespace std;

int main(){
  int matrix[5][5];
  for(int i=0;i<5;i++){
    for(int j=0;j<5;j++){
      int el;
      cin>>el;
      matrix[i][j] = el;
    }
  }
  int x, y;
  for(int i=0;i<5;i++){
    for(int j=0;j<5;j++){
      if(matrix[i][j] == 1){
        x = i;
        y = j;
      }
    }
  }
  int minMoves = 0;
  minMoves = abs(x - 2) + abs(y - 2);
  cout<<minMoves;
  return 0;
}