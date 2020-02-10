import torch
import torch.nn as nn
import numpy as np

class CPPN(nn.Module):

    def __init__(self, num_hidden, size_hidden):
        
        super().__init__()
        self.input = nn.Linear(2, size_hidden)
        self.hiddenList = nn.ModuleList([nn.Linear(size_hidden, size_hidden) for i in range(num_hidden)])
        self.output = nn.Linear(size_hidden, 3)

        self.tanh = nn.Tanh()
        self.sigmoid = nn.Sigmoid()

        self.num_hidden = num_hidden
        self.size_hidden = size_hidden

    def forward(self, x):

        x = self.input(x)

        for hidden in self.hiddenList:
            x = self.tanh(hidden(x))

        x = self.sigmoid(self.output(x))

        return x

    def __str__(self):

        return "input dims : 2\n output dims : 3\n hidden layers : " + str(self.num_hidden) + "\n hidden neurons : " + str(self.size_hidden)

def createImage(model, dim):

  pixels = (np.indices((dim, dim), dtype = np.float32))
  pixels = pixels.swapaxes(1, 2)
  pixels = pixels.transpose().reshape(-1,2) / dim  -0.5
  pixels_torch  = torch.from_numpy(pixels)
  output = model(pixels_torch)
  output = output.reshape(dim,dim, 3)
  output = output.detach().numpy()
#   print(output.shape)

#   print(f"Min : {output.min()}\nMax : {output.max()}")
  return output

#weight initialisation
def init_weights(m):
  if type(m) == nn.Linear:

      torch.nn.init.normal_(m.weight)
      m.bias.data.fill_(1.0)

    #   if initDropdown.value == 'normal':
    #     torch.nn.init.normal_(m.weight)
    #   if initDropdown.value == 'kaiming normal':
    #       torch.nn.init.kaiming_normal_(m.weight)
    #   if initDropdown.value == 'kaiming uniform':
    #       torch.nn.init.kaiming_uniform_(m.weight)

    #   m.bias.data.fill_(biasSlider.value)

