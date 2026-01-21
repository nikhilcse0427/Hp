#include<iostream>
using namespace std;

int main(){
  int n, m; //  n->row, m->col
  cin>>n>>m;
  int temp = 0;
  for(int i=0;i<n;i++){
    if(i%2 == 0){
        for(int j=0;j<m;j++){
          cout<<'#';
        }
        cout<<endl;
    }else{
      if(temp == 0){
        for(int j=0;j<m-1;j++){
          cout<<'.';
        }
        cout<<'#'<<endl;
        temp = 1;
      }else{
        cout<<'#';
        for(int j=0;j<m-1;j++){
          cout<<'.';
        }
        cout<<endl;
        temp = 0;
      }
    }
  }
  return 0;
}